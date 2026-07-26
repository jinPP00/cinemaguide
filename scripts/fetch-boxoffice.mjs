/**
 * KOBIS(영화진흥위원회) 일별 박스오피스를 받아 data/boxoffice.json으로 저장한다.
 *
 *   KOBIS_API_KEY=xxxx node scripts/fetch-boxoffice.mjs
 *   (.env.local에 KOBIS_API_KEY를 넣어두면 npm run boxoffice로 자동 로드된다)
 *
 * 정적 사이트라 요청마다 실시간으로 부르지 않는다. 이 스크립트를 실행한 시점의
 * 순위를 data/boxoffice.json에 굽고, 그 파일만 페이지가 읽는다.
 * API 키는 이 스크립트 실행에만 쓰이고 결과 JSON에는 들어가지 않는다 — 커밋해도 안전하다.
 *
 * KOBIS는 당일 데이터가 늦게 집계되므로 관례상 "어제" 날짜를 조회한다.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'data', 'boxoffice.json');

const KEY = process.env.KOBIS_API_KEY;
if (!KEY) {
  console.error('KOBIS_API_KEY 환경변수가 없습니다. .env.local에 설정하거나');
  console.error('KOBIS_API_KEY=xxxx node scripts/fetch-boxoffice.mjs 로 실행하세요.');
  process.exit(1);
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function main() {
  const targetDt = yesterday();
  const url =
    'https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json' +
    `?key=${KEY}&targetDt=${targetDt}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`KOBIS 응답 오류: HTTP ${res.status}`);
  }
  const data = await res.json();

  if (data.faultInfo) {
    throw new Error(`KOBIS 오류: ${data.faultInfo.message}`);
  }

  const list = data.boxOfficeResult?.dailyBoxOfficeList ?? [];
  const movies = list.slice(0, 10).map((m) => ({
    rank: Number(m.rank),
    movieCd: m.movieCd,
    name: m.movieNm,
    openDate: m.openDt,
    audienceToday: Number(m.audiCnt),
    audienceTotal: Number(m.audiAcc),
    salesShare: Number(m.salesShare),
  }));

  const out = {
    targetDate: targetDt,
    fetchedAt: new Date().toISOString(),
    movies,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`박스오피스 ${movies.length}건 저장: ${OUT} (기준일 ${targetDt})`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
