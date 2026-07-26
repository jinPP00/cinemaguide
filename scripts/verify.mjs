/**
 * 정규화 결과 검증 — normalize.mjs 실행 후 돌린다.
 *   node scripts/verify.mjs
 * 실패 시 exit code 1.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', 'data');
const read = (f) => JSON.parse(readFileSync(join(DATA, f), 'utf-8'));

const branches = read('branches.json');
const prices = read('prices.json');
const meta = read('meta.json');

let failed = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

/* 1. 총계 */
check('총 지점 425건', branches.length === 425, `${branches.length}건`);
check(
  '브랜드별 수 (CGV 177 / 롯데 133 / 메가박스 115)',
  branches.filter((b) => b.brand === 'cgv').length === 177 &&
    branches.filter((b) => b.brand === 'lotte').length === 133 &&
    branches.filter((b) => b.brand === 'megabox').length === 115,
);

/* 2. 필수 필드 누락 */
const noSido = branches.filter((b) => !b.sido);
check('시도 파싱 누락 0건', noSido.length === 0, noSido.map((b) => b.name).join(', '));

const noAddress = branches.filter((b) => !b.address);
check('주소 누락 0건', noAddress.length === 0, noAddress.map((b) => b.name).join(', '));

const noUrl = branches.filter((b) => !b.officialUrl || !b.scheduleUrl);
check('공식 URL·상영시간표 URL 누락 0건', noUrl.length === 0);

/* 3. 페이지 슬러그(최상위 URL) 고유성 — 사이트 전체에서 겹치면 안 된다 */
const pageSlugs = branches.map((b) => b.pageSlug);
const dupPageSlugs = pageSlugs.filter((k, i) => pageSlugs.indexOf(k) !== i);
check(
  '페이지 슬러그(URL) 전역 중복 0건',
  dupPageSlugs.length === 0,
  [...new Set(dupPageSlugs)].join(', '),
);

// 브랜드 허브 라우트(cgv/롯데시네마/메가박스)와 지점 페이지 슬러그가
// 같은 [slug] 동적 세그먼트를 공유하므로 절대 겹치면 안 된다
const brandSegments = new Set(['cgv', '롯데시네마', '메가박스']);
const collideWithBrand = branches.filter((b) => brandSegments.has(b.pageSlug));
check(
  '페이지 슬러그가 브랜드 허브 경로와 겹치지 않음',
  collideWithBrand.length === 0,
  collideWithBrand.map((b) => b.pageSlug).join(', '),
);

const emptySlug = branches.filter((b) => !b.slug || !b.pageSlug);
check('빈 슬러그 0건', emptySlug.length === 0, emptySlug.map((b) => b.name).join(', '));

/* 4. 슬러그에 URL에서 문제되는 문자가 없는지 */
const badSlug = branches.filter((b) => /[\s()[\]{}?#&=+%]/.test(b.slug));
check(
  '슬러그에 공백·괄호·예약문자 없음',
  badSlug.length === 0,
  badSlug.slice(0, 5).map((b) => b.slug).join(', '),
);
const badPageSlug = branches.filter((b) => /[\s()[\]{}?#&=+%]/.test(b.pageSlug));
check(
  '페이지 슬러그에 공백·괄호·예약문자 없음',
  badPageSlug.length === 0,
  badPageSlug.slice(0, 5).map((b) => b.pageSlug).join(', '),
);

/* 5. id 고유성 */
const ids = branches.map((b) => b.id);
check('id 중복 0건', new Set(ids).size === ids.length);

/* 6. 요금 정규화 */
const priceRows = Object.values(prices).flat();
check('요금 행 존재', priceRows.length > 0, `${priceRows.length}행`);

const badDay = priceRows.filter((r) => r.dayType !== '평일' && r.dayType !== '주말');
check(
  'dayType은 평일/주말만 (WKDAY 등 원본 코드 잔존 없음)',
  badDay.length === 0,
  [...new Set(badDay.map((r) => r.dayType))].join(', '),
);

const zeroPrice = priceRows.filter(
  (r) => r.adult === 0 || r.youth === 0 || r.senior === 0 || r.disabled === 0,
);
check('0원 가격 없음 (해당없음은 null 처리)', zeroPrice.length === 0, `${zeroPrice.length}행`);

const noAdult = priceRows.filter((r) => r.adult == null);
check('성인 요금 누락 0행', noAdult.length === 0, `${noAdult.length}행`);

const noLabel = priceRows.filter((r) => !r.label);
check('요금 라벨 누락 0행', noLabel.length === 0);

/* 7. 롯데 평일/주말 확장이 제대로 됐는지 (한 행 → 두 행) */
const lotteIds = branches.filter((b) => b.brand === 'lotte' && b.hasPrices).map((b) => b.id);
const lotteRows = lotteIds.flatMap((id) => prices[id] ?? []);
const lotteWeekday = lotteRows.filter((r) => r.dayType === '평일').length;
const lotteWeekend = lotteRows.filter((r) => r.dayType === '주말').length;
check('롯데 평일·주말 행 수 동일 (확장 정상)', lotteWeekday === lotteWeekend, `평일 ${lotteWeekday} / 주말 ${lotteWeekend}`);

/* 8. 브랜드별 데이터 제약이 기획서 4.1과 일치하는지 */
// 메가박스는 좌표 필드가 없지만 길찾기 링크에서 추출한다 → 전 지점 좌표 보유
const noCoords = branches.filter((b) => !b.lat || !b.lng);
check('전 지점 좌표 보유 (지도 임베드 가능)', noCoords.length === 0, `누락 ${noCoords.length}건`);

const badCoords = branches.filter((b) => {
  const lat = Number(b.lat);
  const lng = Number(b.lng);
  // 대한민국 대략 범위 (제주 남단 ~ 강원 북단, 서해 ~ 동해)
  return !(lat > 33 && lat < 39 && lng > 124 && lng < 132);
});
check(
  '좌표가 한반도 범위 안에 있음',
  badCoords.length === 0,
  badCoords.slice(0, 5).map((b) => `${b.name}(${b.lat},${b.lng})`).join(', '),
);

const cgvWithTel = branches.filter((b) => b.brand === 'cgv' && b.tel).length;
check('CGV 전화번호 보유', cgvWithTel > 0, `${cgvWithTel}건`);

const shortTel = branches.filter((b) => b.tel && b.tel.replace(/\D/g, '').length < 9);
check(
  '전화번호가 지역번호만 있는 경우 없음(9자리 미만)',
  shortTel.length === 0,
  shortTel.map((b) => `${b.name}:${b.tel}`).join(', '),
);

const megaboxWithFacility = branches.filter((b) => b.brand === 'megabox' && b.facility?.floors).length;
check('메가박스 층별안내 보유', megaboxWithFacility > 0, `${megaboxWithFacility}건`);

/* 9. 휴관 지점 처리 */
const closed = branches.filter((b) => b.status === '휴관');
check('휴관 지점 4건 분리', closed.length === 4, closed.map((b) => b.name).join(', '));
const closedNameLeftover = closed.filter((b) => b.name.includes('휴관'));
check('휴관 표기가 지점명에 남아있지 않음', closedNameLeftover.length === 0);

/* 10. meta */
check('meta 시도 17개', meta.sidoOrder.length === 17, meta.sidoOrder.join(' '));
check('meta 경고 0건', (meta.warnings ?? []).length === 0);

console.log(`\n${failed === 0 ? '전체 통과' : `${failed}건 실패`}`);
process.exit(failed === 0 ? 0 : 1);
