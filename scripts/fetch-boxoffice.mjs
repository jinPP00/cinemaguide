/**
 * KOBIS(영화진흥위원회) 일별 박스오피스를 받아 public/boxoffice.json으로 저장한다.
 *
 *   KOBIS_API_KEY=xxxx node scripts/fetch-boxoffice.mjs
 *   (.env.local에 KOBIS_API_KEY를 넣어두면 npm run boxoffice로 자동 로드된다)
 *
 * public/ 아래 두는 이유: 페이지 HTML에 굽지 않고 브라우저가 이 파일을 직접
 * fetch해서 읽게 하기 위해서다. 그래야 순위가 바뀔 때 이 파일 하나만 새로
 * 올리면 되고, 425개 지점 페이지를 통째로 재빌드·재배포할 필요가 없다.
 * API 키는 이 스크립트 실행에만 쓰이고 결과 JSON에는 들어가지 않는다 — 커밋해도 안전하다.
 *
 * KOBIS는 당일 데이터가 늦게 집계되므로 관례상 "어제" 날짜를 조회한다.
 * 순위(rank 순서로 나열한 movieCd 목록)가 기존 파일과 같으면 굳이 덮어쓰지
 * 않는다 — 불필요한 배포/캐시 무효화를 줄이기 위해서다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'boxoffice.json');

function rankingOf(movies) {
  return movies.map((m) => m.movieCd).join(',');
}

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

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    // fetch 자체가 실패하면(DNS/연결거부/타임아웃 등) 원인을 최대한 자세히 남긴다.
    // KOBIS 같은 국내 공공 API는 해외 IP(예: GitHub Actions 러너)를 막는 경우가 있어
    // 이 로그로 그 가능성부터 확인한다.
    console.error('fetch 자체가 실패했습니다:', err.message);
    if (err.cause) console.error('원인(cause):', err.cause);
    throw err;
  }
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

  if (existsSync(OUT)) {
    const prev = JSON.parse(readFileSync(OUT, 'utf-8'));
    if (rankingOf(prev.movies) === rankingOf(movies)) {
      console.log(`박스오피스 순위 변동 없음 — 갱신 생략 (기준일 ${targetDt})`);
      return;
    }
  }

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
