/**
 * 3사 크롤링 데이터(cinema-chains) → 사이트용 공통 스키마 변환
 *
 *   node scripts/normalize.mjs
 *
 * 입력 : ../cinema-chains/{cgv,lotte,megabox}/{theaters,prices}.json  (읽기 전용, 수정하지 않음)
 * 출력 : data/branches.json  data/prices.json  data/meta.json
 *
 * 이 스크립트는 로컬 개발 단계에서만 실행한다.
 * 결과 JSON을 저장소에 커밋하므로 Cloudflare 빌드 시에는 실행되지 않는다.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const SOURCE_DIR = process.env.CINEMA_CHAINS_DIR
  ? resolve(process.env.CINEMA_CHAINS_DIR)
  : resolve(PROJECT_ROOT, '..', 'cinema-chains');
const OUT_DIR = join(PROJECT_ROOT, 'data');

/** 크롤링 기준일 — 사이트에 "마지막 확인일"로 노출된다 */
const CHECKED_AT = '2026-07-23';

const BRANDS = {
  cgv: { name: 'CGV', urlSegment: 'cgv' },
  lotte: { name: '롯데시네마', urlSegment: '롯데시네마' },
  megabox: { name: '메가박스', urlSegment: '메가박스' },
};

/* ------------------------------------------------------------------ *
 * 시도 정규화
 * 3사 주소 표기가 제각각이라 별칭을 표준 17개 시도로 매핑한다.
 * 별칭은 "긴 것 우선"으로 매칭한다. (전남광주통합특별시가 전남으로 잘못
 * 잡히면 안 되므로 순서가 아니라 길이로 정렬해서 검사한다.)
 * ------------------------------------------------------------------ */
const SIDO_ALIASES = {
  서울: ['서울특별시', '서울시', '서울'],
  경기: ['경기도', '경기'],
  인천: ['인천광역시', '인천시', '인천'],
  강원: ['강원특별자치도', '강원도', '강원'],
  충북: ['충청북도', '충북'],
  충남: ['충청남도', '충남'],
  대전: ['대전광역시', '대전시', '대전'],
  세종: ['세종특별자치시', '세종시', '세종'],
  전북: ['전북특별자치도', '전라북도', '전북'],
  전남: ['전라남도', '전남'],
  // '전남광주통합특별시'는 CGV 데이터에서 광주 지점에 쓰인 비표준 표기다.
  // 같은 데이터 안에 '광주광역시' 표기와 혼재하므로 광주로 통일한다.
  광주: ['전남광주통합특별시', '광주광역시', '광주시', '광주'],
  경북: ['경상북도', '경북'],
  대구: ['대구광역시', '대구시', '대구'],
  경남: ['경상남도', '경남'],
  부산: ['부산광역시', '부산시', '부산'],
  울산: ['울산광역시', '울산시', '울산'],
  제주: ['제주특별자치도', '제주도', '제주'],
};

/** [별칭, 표준시도] 목록을 별칭 길이 내림차순으로 준비 */
const ALIAS_TABLE = Object.entries(SIDO_ALIASES)
  .flatMap(([sido, aliases]) => aliases.map((alias) => [alias, sido]))
  .sort((a, b) => b[0].length - a[0].length);

/** 사이트 노출 순서 (수도권 → 남쪽) */
const SIDO_ORDER = [
  '서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종',
  '전북', '전남', '광주', '경북', '대구', '경남', '부산', '울산', '제주',
];

/**
 * 주소 문자열에서 시도·시군구를 추출한다.
 * "경기용인시 기흥구 …"처럼 붙여 쓴 표기도 접두어 매칭으로 처리된다.
 */
function parseAddress(rawAddress) {
  const address = String(rawAddress || '').replace(/\s+/g, ' ').trim();
  if (!address) return { sido: null, sigungu: null, address: '' };

  for (const [alias, sido] of ALIAS_TABLE) {
    if (!address.startsWith(alias)) continue;
    const rest = address.slice(alias.length).trim();
    const sigungu = rest.split(' ')[0] || null;
    return { sido, sigungu, address };
  }
  return { sido: null, sigungu: null, address };
}

/* ------------------------------------------------------------------ *
 * 슬러그
 * URL은 한글을 쓰되(기획서 6.1), 공백·구두점은 URL에서 지저분하므로 정리한다.
 * ------------------------------------------------------------------ */
function cleanSlug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[()[\]{}]/g, '')        // 괄호 제거
    .replace(/[·・/,.]/g, '-')        // 구분 기호는 하이픈
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** 괄호 안 부가설명을 뺀 짧은 슬러그. 중복되면 전체 이름으로 되돌린다. */
function baseSlug(name) {
  const withoutParens = name.replace(/\([^)]*\)/g, ' ').trim();
  return cleanSlug(withoutParens || name);
}

/* ------------------------------------------------------------------ *
 * 공통 유틸
 * ------------------------------------------------------------------ */
const text = (value) => {
  const s = String(value ?? '').trim();
  return s ? s : null;
};

const joinLines = (value) => {
  if (!Array.isArray(value)) return text(value);
  const lines = value.map((v) => String(v).trim()).filter(Boolean);
  return lines.length ? lines.join('\n') : null;
};

/**
 * 전화번호 검증. 원본 CGV 크롤링 데이터 중 일부(30곳)는 지역번호만 있고
 * 실제 국번·번호가 없다(예: "031"). 그대로 노출하면 깨진 것처럼 보이므로
 * 자릿수가 지역번호 수준(4자리 이하)이면 버린다.
 */
const validTel = (value) => {
  const t = text(value);
  if (!t) return null;
  return t.replace(/\D/g, '').length >= 9 ? t : null;
};

/**
 * 요금 값 정리.
 * 원본에서 0 또는 -1은 "해당 등급·시간대 없음"을 뜻하는 표식이다.
 * (예: 메가박스 김천점은 심야 상영이 없어 adult_price가 -1)
 * 그대로 두면 화면에 "0원"으로 나가 오해를 주므로 null로 바꾼다.
 */
const price = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** 모든 요금이 비어 있는 행은 화면에 빈 줄로 보이므로 버린다 */
const hasAnyPrice = (row) =>
  row.adult != null || row.youth != null || row.senior != null || row.disabled != null;

/**
 * 메가박스는 좌표 필드를 따로 주지 않지만, 길찾기 링크가 네이버 지도 URL이라
 * 쿼리스트링에 좌표가 들어 있다.
 *   http://m.map.naver.com/map.nhn?lng=127.0264086&lat=37.498214&level=2
 */
function coordsFromMapLink(url) {
  const s = String(url || '');
  const lat = /[?&]lat=([0-9.]+)/.exec(s)?.[1] ?? null;
  const lng = /[?&]lng=([0-9.]+)/.exec(s)?.[1] ?? null;
  return { lat, lng };
}

function readJson(brand, file) {
  const path = join(SOURCE_DIR, brand, `${file}.json`);
  if (!existsSync(path)) throw new Error(`입력 파일 없음: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

/* ------------------------------------------------------------------ *
 * 브랜드별 변환기
 * 각 브랜드가 가진 필드가 달라서(기획서 4.1) 없는 항목은 null로 둔다.
 * 화면에서는 null인 섹션을 아예 렌더링하지 않는다.
 * ------------------------------------------------------------------ */
const ADAPTERS = {
  cgv(row) {
    return {
      sourceId: row.bzplcNo,
      priceKey: String(row.bzplcNo).slice(0, 4), // prices.json은 siteNo(앞 4자리) 기준
      name: row.name,
      rawAddress: row.address,
      tel: validTel(row.tel),
      lat: text(row.latitude),
      lng: text(row.longitude),
      specialScreens: Array.isArray(row.special_screens)
        ? row.special_screens.filter(Boolean)
        : [],
      screenCount: null,
      seatCount: null,
      intro: null,
      transit: { raw: text(row.traffic_info), bus: null, subway: null },
      parking: { raw: text(row.parking_info), guide: null, howTo: null, fee: null },
      facility: null,
      officialUrl: row.site_link,
      scheduleUrl: row.site_link, // CGV는 지점 페이지 안에서 상영시간표를 연다
    };
  },

  lotte(row) {
    return {
      sourceId: row.cinemaID,
      priceKey: row.cinemaID,
      name: row.name,
      rawAddress: row.address,
      tel: null,
      lat: text(row.latitude),
      lng: text(row.longitude),
      // 원본은 내부 코드(예: "400")만 주므로 이름을 알 수 없다.
      // 요금표의 스페셜관 이름으로 나중에 채운다.
      specialScreens: [],
      screenCount: Number.isFinite(row.total_screen_count) ? row.total_screen_count : null,
      seatCount: Number.isFinite(row.total_seat_count) ? row.total_seat_count : null,
      intro: null,
      transit: {
        raw: null,
        bus: text(row.public_transport),
        subway: text(row.subway_info),
      },
      parking: {
        raw: null,
        guide: text(row.parking_directions),
        howTo: null,
        fee: text(row.parking_fee),
      },
      facility: null,
      officialUrl: row.site_link,
      scheduleUrl: row.site_link, // 롯데도 지점 페이지에 상영시간표가 함께 있다
    };
  },

  megabox(row) {
    const parking = row.parking || {};
    const transport = row.public_transport || {};
    const facilityScreens = row.facility_info?.['보유시설'] ?? null;
    // 좌표 전용 필드는 없지만 길찾기 링크(네이버 지도 URL)에서 뽑아낼 수 있다
    const { lat, lng } = coordsFromMapLink(row.traffic_info?.map_link);
    return {
      sourceId: row.brchNo,
      priceKey: row.brchNo,
      name: row.name,
      rawAddress: row.traffic_info?.address, // 메가박스만 주소가 한 단계 안에 있다
      tel: null,
      lat,
      lng,
      specialScreens: [],
      screenCount: null,
      seatCount: null,
      intro: text(row.intro),
      transit: {
        raw: null,
        bus: joinLines(transport['버스']),
        subway: joinLines(transport['지하철']),
      },
      parking: {
        raw: null,
        guide: joinLines(parking['주차안내']),
        howTo: joinLines(parking['주차확인']),
        fee: joinLines(parking['주차요금']),
      },
      facility: {
        screens: Array.isArray(facilityScreens) && facilityScreens.length ? facilityScreens : null,
        floors: Array.isArray(row.floor_info) && row.floor_info.length ? row.floor_info : null,
      },
      mapLink: text(row.traffic_info?.map_link),
      officialUrl: row.site_link,
      scheduleUrl: `https://www.megabox.co.kr/theater/time?brchNo=${row.brchNo}`,
    };
  },
};

/* ------------------------------------------------------------------ *
 * 요금 정규화
 * 3사 스키마가 크게 달라 공통 행으로 편다.
 *   { label, timeSlot, dayType, adult, youth, senior, disabled }
 * label은 원본 표기를 살린다. (억지로 2D/3D를 분해하면 원본과 어긋날 수 있다)
 * ------------------------------------------------------------------ */
const PRICE_ADAPTERS = {
  cgv(entry) {
    return (entry.prices || []).map((p) => ({
      label: text(p.format) ?? '일반',
      timeSlot: text(p.time_slot),
      dayType: text(p.day_type), // 이미 평일/주말
      adult: price(p.adult_price),
      youth: price(p.youth_price),
      senior: null,
      disabled: null,
    }));
  },

  lotte(entry) {
    // 롯데는 한 행에 평일·주말이 함께 들어있어 두 행으로 펼친다.
    const expand = (rows, labelPrefix) =>
      (rows || []).flatMap((p) => {
        const label = [labelPrefix, text(p.format)].filter(Boolean).join(' ');
        return [
          {
            label: label || '일반관',
            timeSlot: text(p.time_slot),
            dayType: '평일',
            adult: price(p.adult_weekday),
            youth: price(p.youth_weekday),
            senior: price(p.senior_weekday),
            disabled: price(p.disabled_weekday),
          },
          {
            label: label || '일반관',
            timeSlot: text(p.time_slot),
            dayType: '주말',
            adult: price(p.adult_weekend),
            youth: price(p.youth_weekend),
            senior: price(p.senior_weekend),
            disabled: price(p.disabled_weekend),
          },
        ];
      });

    const rows = expand(entry.regular_fee, null);
    for (const [specialName, specialRows] of Object.entries(entry.special_fee || {})) {
      rows.push(...expand(specialRows, specialName));
    }
    return rows;
  },

  megabox(entry) {
    const DAY = { WKDAY: '평일', WKEND: '주말' };
    return (entry.prices || []).map((p) => {
      const parts = [text(p.hall_type), text(p.movie_format)];
      // 좌석 등급이 '일반'이면 라벨에 넣어봐야 정보가 없다
      if (p.seat_class && p.seat_class !== '일반') parts.push(p.seat_class);
      return {
        label: parts.filter(Boolean).join(' ') || '일반',
        timeSlot: text(p.time_slot),
        dayType: DAY[p.day_type] ?? text(p.day_type),
        adult: price(p.adult_price),
        youth: price(p.youth_price),
        senior: null,
        disabled: null,
      };
    });
  },
};

/**
 * 스페셜관 이름 복원.
 * 롯데·메가박스는 지점 데이터에 특별관 이름이 없다(롯데는 "400" 같은 내부 코드만).
 * 요금표에는 이름이 그대로 들어 있어 거기서 가져온다.
 */
function lotteSpecialScreenNames(entry) {
  return Object.keys(entry?.special_fee || {}).filter(Boolean);
}

function megaboxSpecialScreenNames(entry) {
  const halls = new Set();
  for (const row of entry?.prices || []) {
    const hall = String(row.hall_type ?? '').trim();
    if (hall && hall !== '일반') halls.add(hall);
  }
  return [...halls];
}

/* ------------------------------------------------------------------ *
 * 메인
 * ------------------------------------------------------------------ */
function main() {
  const branches = [];
  const pricesById = {};
  const warnings = [];
  let droppedPriceRows = 0; // 원본이 -1/0(해당없음)이라 버린 요금 행 수

  for (const [brand, meta] of Object.entries(BRANDS)) {
    const theaters = readJson(brand, 'theaters');
    const priceEntries = readJson(brand, 'prices');
    const adapt = ADAPTERS[brand];
    const adaptPrices = PRICE_ADAPTERS[brand];

    // 요금 데이터를 지점 키로 색인
    const priceIndex = new Map();
    for (const entry of priceEntries) {
      const key = String(entry.siteNo ?? entry.cinemaID ?? entry.brchNo ?? '');
      if (key) priceIndex.set(key, entry);
    }

    // slug: 시도 목록 페이지 안에서만 겹치지 않으면 되는 짧은 표시용 슬러그
    const slugTaken = new Map();
    // pageSlug: 사이트 최상위 URL에 쓰는 전역 슬러그. 브랜드 단위로만 겹치지 않으면 된다
    // (브랜드가 다르면 접미사가 달라 자동으로 안 겹친다).
    const pageSlugTaken = new Map();

    for (const row of theaters) {
      const src = adapt(row);
      const { sido, sigungu, address } = parseAddress(src.rawAddress);

      if (!sido) {
        warnings.push(`[${brand}] 시도 파싱 실패: ${src.name} / 주소="${src.rawAddress ?? ''}"`);
      }

      // 지점명에 붙은 (휴관) 표기를 상태로 분리한다
      const isClosed = /\(휴관\)/.test(src.name);
      const displayName = src.name.replace(/\s*\(휴관\)\s*/g, '').trim();

      // 슬러그(시도 안 목록용) 결정: 짧은 형태 우선, 같은 시도 안에서 겹치면 전체 이름 사용
      const scope = `${sido ?? 'unknown'}`;
      let slug = baseSlug(displayName);
      const takenInScope = slugTaken.get(scope) ?? new Set();
      if (!slug || takenInScope.has(slug)) {
        const full = cleanSlug(displayName);
        if (takenInScope.has(full)) {
          warnings.push(`[${brand}/${scope}] 슬러그 중복 해결 실패: ${displayName} → ${full}`);
        }
        slug = full;
      }
      takenInScope.add(slug);
      slugTaken.set(scope, takenInScope);

      // 페이지 슬러그(최상위 URL용): 지점명이 이미 시도명을 포함하면 그대로,
      // 아니면 시도명을 앞에 붙인다. 예) "강남"(서울) → "서울강남", "경기광주"(경기) → 그대로
      const brandSlugPart = cleanSlug(meta.urlSegment);
      let locationPart = sido && !displayName.startsWith(sido)
        ? cleanSlug(`${sido}${displayName}`)
        : cleanSlug(displayName);
      let pageSlug = `${locationPart}-${brandSlugPart}`;
      const takenPageSlugs = pageSlugTaken.get(brand) ?? new Set();
      if (takenPageSlugs.has(pageSlug)) {
        // 시도명을 붙여도 겹치면(동일 브랜드 내 동명 지점) 시군구를 더 붙인다
        const withSigungu = cleanSlug(`${sido ?? ''}${sigungu ?? ''}${displayName}`);
        pageSlug = `${withSigungu}-${brandSlugPart}`;
        if (takenPageSlugs.has(pageSlug)) {
          warnings.push(`[${brand}] 페이지 슬러그 중복 해결 실패: ${displayName} → ${pageSlug}`);
        }
      }
      takenPageSlugs.add(pageSlug);
      pageSlugTaken.set(brand, takenPageSlugs);

      const id = `${brand}-${src.sourceId}`;
      const priceEntry = priceIndex.get(String(src.priceKey));
      const rawPriceRows = priceEntry ? adaptPrices(priceEntry) : [];
      const priceRows = rawPriceRows.filter(hasAnyPrice);
      droppedPriceRows += rawPriceRows.length - priceRows.length;
      if (priceRows.length) pricesById[id] = priceRows;

      // 롯데·메가박스는 지점 데이터에 스페셜관 이름이 없어 요금표에서 가져온다
      const specialScreens =
        brand === 'lotte'
          ? lotteSpecialScreenNames(priceEntry)
          : brand === 'megabox'
            ? megaboxSpecialScreenNames(priceEntry)
            : src.specialScreens;

      branches.push({
        id,
        brand,
        brandName: meta.name,
        brandSegment: meta.urlSegment,
        name: displayName,
        slug,
        pageSlug,
        sido,
        sigungu,
        address,
        tel: src.tel,
        lat: src.lat,
        lng: src.lng,
        specialScreens,
        screenCount: src.screenCount,
        seatCount: src.seatCount,
        intro: src.intro,
        transit: src.transit,
        parking: src.parking,
        facility: src.facility ?? null,
        mapLink: src.mapLink ?? null,
        status: isClosed ? '휴관' : '운영중',
        hasPrices: priceRows.length > 0,
        officialUrl: src.officialUrl,
        scheduleUrl: src.scheduleUrl,
        sourceId: src.sourceId,
        originalRegion: row.region ?? null,
        checkedAt: CHECKED_AT,
        // 원본에 값이 아예 없던 항목이 있으면 화면에서 "확인 필요"로 표시한다
        verificationStatus:
          !address || (!src.transit.raw && !src.transit.bus && !src.transit.subway)
            ? '확인필요'
            : '확인완료',
      });
    }
  }

  /* 통계 ------------------------------------------------------------ */
  const byBrandSido = {};
  for (const b of branches) {
    byBrandSido[b.brand] ??= {};
    byBrandSido[b.brand][b.sido ?? 'unknown'] =
      (byBrandSido[b.brand][b.sido ?? 'unknown'] ?? 0) + 1;
  }

  const usedSido = SIDO_ORDER.filter((s) => branches.some((b) => b.sido === s));

  const metaOut = {
    generatedAt: new Date().toISOString().slice(0, 10),
    checkedAt: CHECKED_AT,
    totalBranches: branches.length,
    brands: Object.entries(BRANDS).map(([key, v]) => ({
      key,
      name: v.name,
      segment: v.urlSegment,
      count: branches.filter((b) => b.brand === key).length,
    })),
    sidoOrder: usedSido,
    byBrandSido,
    counts: {
      휴관: branches.filter((b) => b.status === '휴관').length,
      좌표없음: branches.filter((b) => !b.lat).length,
      요금없음: branches.filter((b) => !b.hasPrices).length,
      확인필요: branches.filter((b) => b.verificationStatus === '확인필요').length,
    },
    warnings,
  };

  writeFileSync(join(OUT_DIR, 'branches.json'), JSON.stringify(branches, null, 2), 'utf-8');
  writeFileSync(join(OUT_DIR, 'prices.json'), JSON.stringify(pricesById, null, 2), 'utf-8');
  writeFileSync(join(OUT_DIR, 'meta.json'), JSON.stringify(metaOut, null, 2), 'utf-8');

  /* 리포트 ---------------------------------------------------------- */
  console.log(`지점 ${branches.length}건, 요금 보유 ${Object.keys(pricesById).length}건`);
  if (droppedPriceRows) {
    console.log(`  (원본이 해당없음(-1/0)이라 제외한 요금 행 ${droppedPriceRows}개)`);
  }
  for (const b of metaOut.brands) console.log(`  ${b.name}: ${b.count}`);
  console.log(`시도 ${usedSido.length}개: ${usedSido.join(' ')}`);
  console.log(
    `휴관 ${metaOut.counts.휴관} / 좌표없음 ${metaOut.counts.좌표없음} / ` +
      `요금없음 ${metaOut.counts.요금없음} / 확인필요 ${metaOut.counts.확인필요}`,
  );
  if (warnings.length) {
    console.log(`\n경고 ${warnings.length}건:`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main();
