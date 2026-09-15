/**
 * CGV 공식 지점 페이지에서 교통(bzplcGuidDsc)·주차(bzplcPrkgGuidDsc) 안내를
 * 다시 받아 data/manual-overrides.json에 넣는다.
 *
 *   node scripts/recrawl-cgv-guides.mjs            # 교통·주차가 비어 있는 운영 지점만
 *   node scripts/recrawl-cgv-guides.mjs cgv-0112001 # 특정 지점만
 *
 * 왜 따로 있나: 원본 크롤러(cinema-chains/cgv/scripts/crawl_theaters.py)는
 * bzplcBrchInfo 뒤 8,000자만 잘라 정규식으로 읽는데, 안내문이 인라인 CSS로
 * 길어진 지점(여의도·청담씨네시티 등 19곳)은 그 범위를 넘어 값이 깨졌다
 * ("$31" 같은 치환 잔여물). 그래서 그 지점들은 화면에 "아직 확인하지 못했습니다"만
 * 나갔다. 원본 cinema-chains는 읽기 전용으로 두고, 재수집 결과는 출처·확인일과
 * 함께 manual-overrides로 얹는다(normalize.mjs가 마지막에 병합).
 *
 * 브라우저 헤더 없이 요청하면 13KB짜리 빈 껍데기가 오고 데이터가 없다 —
 * Accept·Accept-Language를 같이 보내야 SSR 페이로드가 포함된 전체 HTML이 온다.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BRANCHES = join(ROOT, 'data', 'branches.json');
const OVERRIDES = join(ROOT, 'data', 'manual-overrides.json');
const TODAY = new Date().toISOString().slice(0, 10);

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** RSC 페이로드 안의 "bzplcBrchInfo":{...} 객체를 중괄호 균형으로 잘라 파싱한다 */
function extractBranchInfo(html) {
  // 페이로드는 self.__next_f.push([1,"..."]) 문자열 리터럴 안에 있어 따옴표가
  // \" 로, 꺾쇠가 < 로 이스케이프돼 있다. 리터럴을 먼저 JS 문자열로 되돌린다.
  const literalRe = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  for (const m of html.matchAll(literalRe)) {
    if (!m[1].includes('bzplcBrchInfo')) continue;
    const decoded = JSON.parse(m[1]);
    const key = '"bzplcBrchInfo":';
    const idx = decoded.indexOf(key);
    if (idx === -1) continue;
    const start = decoded.indexOf('{', idx);
    let depth = 0;
    let inStr = false;
    for (let i = start; i < decoded.length; i++) {
      const ch = decoded[i];
      if (inStr) {
        if (ch === '\\') i++;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return JSON.parse(decoded.slice(start, i + 1));
      }
    }
  }
  return null;
}

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&middot;': '·',
  '&rarr;': '→',
};

/** 원본 크롤러의 strip_html과 같은 규칙: 태그는 줄바꿈으로, 빈 줄 제거 */
function stripHtml(s) {
  if (!s) return null;
  const text = s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&middot;|&rarr;/g, (e) => ENTITIES[e])
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)));
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return lines.length ? lines.join('\n') : null;
}

const isEmpty = (o) => !o || Object.values(o).every((v) => v == null);

/**
 * 교통 원문의 구간 구조만 파서가 아는 형식으로 맞춘다. 문장은 손대지 않는다.
 *
 * 화면 파서(app/[slug]/page.tsx의 extractTransit)는 "지하철"·"버스"가 한 줄씩
 * 따로 있는 원문(판교 등)을 기준으로 구간을 나눈다. 여의도처럼 첫 줄이 곧바로
 * "5,9호선 여의도역 …"이고 버스 헤딩이 "버스 [여의도환승센터]"로 정류장과 붙어
 * 있으면 구간을 못 나눠 노선 파서가 "5,9"를 버스 번호로 잘못 잡았다.
 */
function normalizeCgvTransit(raw) {
  if (!raw) return raw;
  const lines = raw.split('\n');
  const out = [];
  const hasSubwayHeading = lines.some((l) => /^지하철\s*$/.test(l));
  if (!hasSubwayHeading && /호선|역\b/.test(lines[0]) && !/^버스/.test(lines[0])) out.push('지하철');
  for (const line of lines) {
    const m = line.match(/^버스\s*\[(.+)\]\s*$/);
    if (m) {
      out.push('버스', `* ${m[1].trim()} 정류장`);
      continue;
    }
    // "5,9호선 여의도역 …" → "5호선/9호선 | 여의도역 …" (판교 원문과 같은 표기).
    // 노선 파서가 "5,9"를 버스 번호 목록으로 읽는 것을 막는다. 뜻은 같다.
    // \b는 한글 앞뒤에서 동작하지 않는다(유니코드 플래그 없이는 한글이 \W). 공백 기준으로 자른다.
    const multi = line.match(/^(\d+(?:\s*,\s*\d+)+)\s*호선\s+(\S+역(?:\s.*)?)$/);
    if (multi) {
      const linesText = multi[1].split(/\s*,\s*/).map((n) => `${n}호선`).join('/');
      out.push(`${linesText} | ${multi[2]}`);
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

/** "$31" 같은 값 — CGV 공식 데이터의 주차 필드 자체가 이렇게 들어 있는 지점이 있다 */
const isArtifact = (s) => !s || /^\$\d+$/.test(s.trim());

/**
 * 지점 공지사항에서 주차 안내를 찾는다. 공식 상세 필드(bzplcPrkgGuidDsc)가
 * "$31"인 지점들은 실제 주차 안내를 "[여의도] 선물하기 주차안내" 같은 지점
 * 공지로 올려두고 있다(2026-09-15 확인). 화면에서도 그 공지가 주차 안내로 보인다.
 */
async function parkingFromNotices(siteNo, bzplcNo) {
  const url = `https://cgv.co.kr/api/v1/content/site/searchBthtNtceList?coCd=A420&siteNo=${siteNo}&expoChnlCd=01`;
  const res = await fetch(url, {
    headers: { ...HEADERS, Accept: 'application/json', Referer: `https://cgv.co.kr/cnm/bzplcCgv/${bzplcNo}` },
  });
  if (!res.ok) throw new Error(`notice HTTP ${res.status}`);
  const json = await res.json();
  const notices = (json.data ?? []).filter((n) => /주차\s*(안내|요금|확인)/.test(n.ntceCont ?? ''));
  if (notices.length === 0) return null;
  // 주차 공지가 여럿이면 가장 최근 것 하나만 쓴다. 진주혁신은 "[주차 안내]"와
  // "[주차 안내 (내용 일부 변경)]"이 같이 남아 있어 둘을 붙이면 같은 항목이
  // 두 번 나온다. 일련번호(thtNtceSno)가 큰 쪽이 나중 공지다.
  const latest = notices.reduce((a, b) => (Number(b.thtNtceSno) > Number(a.thtNtceSno) ? b : a));
  return stripHtml(latest.ntceCont);
}

async function main() {
  const branches = JSON.parse(readFileSync(BRANCHES, 'utf-8'));
  const overrides = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf-8')) : {};
  const only = process.argv.slice(2);
  // 지점 id를 직접 지정하면 이 스크립트가 넣었던 값은 다시 받는다(재확인 용도).
  // 원본 크롤링에서 온 값은 지정해도 건드리지 않는다 — 검토를 거친 데이터다.
  const force = only.length > 0;

  const targets = branches.filter((b) => {
    if (b.brand !== 'cgv' || b.status !== '운영중') return false;
    if (only.length) return only.includes(b.id);
    return isEmpty(b.transit) || isEmpty(b.parking);
  });
  console.log(`대상 ${targets.length}곳`);

  let updated = 0;
  for (const b of targets) {
    const url = `https://cgv.co.kr/cnm/bzplcCgv/${b.sourceId}`;
    let info = null;
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      info = extractBranchInfo(await res.text());
    } catch (e) {
      console.log(`  ✗ ${b.name}: ${e.message}`);
      await sleep(1500);
      continue;
    }
    if (!info) {
      console.log(`  ✗ ${b.name}: bzplcBrchInfo 없음`);
      await sleep(1500);
      continue;
    }

    const transitRaw = normalizeCgvTransit(stripHtml(info.bzplcGuidDsc));
    let parkingRaw = stripHtml(info.bzplcPrkgGuidDsc);
    let parkingSource = '상세 필드';
    if (isArtifact(parkingRaw)) {
      try {
        parkingRaw = await parkingFromNotices(info.siteNo ?? b.sourceId.slice(0, 4), b.sourceId);
        parkingSource = '지점 공지';
      } catch (e) {
        console.log(`  ! ${b.name}: 공지 조회 실패 (${e.message})`);
        parkingRaw = null;
      }
    }
    const patch = overrides[b.id] ?? {};
    const owned = (field) => Boolean(patch[field]);
    const got = [];
    if ((isEmpty(b.transit) || (force && owned('transit'))) && !isArtifact(transitRaw)) {
      patch.transit = { raw: transitRaw, bus: null, subway: null };
      got.push(`교통 ${transitRaw.length}자`);
    }
    if ((isEmpty(b.parking) || (force && owned('parking'))) && !isArtifact(parkingRaw)) {
      patch.parking = { raw: parkingRaw, guide: null, howTo: null, fee: null };
      got.push(`주차 ${parkingRaw.length}자(${parkingSource})`);
    }
    if (got.length) {
      patch.checkedAt = TODAY;
      patch.verificationStatus = '확인완료';
      overrides[b.id] = patch;
      updated++;
      console.log(`  ✓ ${b.name}: ${got.join(', ')}`);
    } else {
      console.log(`  - ${b.name}: 공식 페이지에도 값 없음 (교통 ${transitRaw ? '있음' : '없음'}, 주차 ${parkingRaw ? '있음' : '없음'})`);
    }
    await sleep(1500);
  }

  writeFileSync(OVERRIDES, JSON.stringify(overrides, null, 2) + '\n', 'utf-8');
  console.log(`\n갱신 ${updated}곳 → ${OVERRIDES}\n이제 npm run data 를 실행해 branches.json에 반영하세요.`);
}

main();
