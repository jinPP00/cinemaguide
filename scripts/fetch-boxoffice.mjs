/**
 * KOBIS(영화진흥위원회) 일별 박스오피스를 받아 public/boxoffice.json으로 저장한다.
 *
 *   KOBIS_API_KEY=xxxx KMDB_API_KEY=yyyy node scripts/fetch-boxoffice.mjs
 *   (.env.local에 넣어두면 npm run boxoffice로 자동 로드된다)
 *
 * KMDB_API_KEY(한국영상자료원 KMDb Open API "영화상세정보")는 선택값이다 —
 * 없으면 포스터 없이(다른 정보는 그대로) 저장한다. KOBIS는 포스터 필드가 없어서
 * 영화명으로 KMDb를 한 번 더 검색해 붙인다.
 *
 * public/ 아래 두는 이유: 페이지 HTML에 굽지 않고 브라우저가 이 파일을 직접
 * fetch해서 읽게 하기 위해서다. 그래야 순위가 바뀔 때 이 파일 하나만 새로
 * 올리면 되고, 425개 지점 페이지를 통째로 재빌드·재배포할 필요가 없다.
 * API 키는 이 스크립트 실행에만 쓰이고 결과 JSON에는 들어가지 않는다 — 커밋해도 안전하다.
 *
 * KOBIS는 당일 데이터가 늦게 집계되므로 관례상 "어제" 날짜를 조회한다.
 * 순위(rank 순서로 나열한 movieCd 목록)가 기존 파일과 같으면 굳이 덮어쓰지
 * 않는다 — 불필요한 배포/캐시 무효화를 줄이기 위해서다.
 *
 * 순위 10개 각각의 감독·배우·장르·관람등급·러닝타임·제작국가는 searchMovieInfo로
 * 한 편씩 추가 조회해서 같이 저장한다(총 최대 11번 호출). 이것도 API 키가
 * 필요한 호출이라 브라우저가 아니라 여기 스크립트에서 미리 받아둬야 한다 —
 * 그래야 클릭 시 상세정보가 이미 받아둔 JSON에서 바로 나온다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'boxoffice.json');

function rankingOf(movies) {
  return movies.map((m) => m.movieCd).join(',');
}

/**
 * GitHub Actions 러너에서 KOBIS 서버로 연결이 간헐적으로 타임아웃되는 걸
 * 몇 차례 겪었다(수동 재실행하면 되긴 했음). 매번 사람이 재실행하지 않도록
 * 스크립트 안에서 몇 번 재시도한다.
 */
async function fetchWithRetry(url, attempts = 3, delayMs = 5000) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        console.error(`fetch 실패(${i + 1}/${attempts}차 시도), ${delayMs}ms 후 재시도:`, err.message);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

const KEY = process.env.KOBIS_API_KEY;
if (!KEY) {
  console.error('KOBIS_API_KEY 환경변수가 없습니다. .env.local에 설정하거나');
  console.error('KOBIS_API_KEY=xxxx node scripts/fetch-boxoffice.mjs 로 실행하세요.');
  process.exit(1);
}

const KMDB_KEY = process.env.KMDB_API_KEY;
if (!KMDB_KEY) {
  console.log('KMDB_API_KEY가 없어 포스터 없이 진행합니다.');
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function fetchMovieInfo(movieCd) {
  const url =
    'https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json' +
    `?key=${KEY}&movieCd=${movieCd}`;
  try {
    const res = await fetchWithRetry(url, 2, 3000);
    if (!res.ok) return null;
    const data = await res.json();
    const info = data.movieInfoResult?.movieInfo;
    if (!info) return null;
    return {
      directors: (info.directors ?? []).map((d) => d.peopleNm).filter(Boolean),
      actors: (info.actors ?? []).slice(0, 5).map((a) => a.peopleNm).filter(Boolean),
      genres: (info.genres ?? []).map((g) => g.genreNm).filter(Boolean),
      watchGrade: info.audits?.[0]?.watchGradeNm ?? null,
      runtime: info.showTm ? Number(info.showTm) : null,
      nations: (info.nations ?? []).map((n) => n.nationNm).filter(Boolean),
    };
  } catch {
    // 개별 영화 상세정보 하나가 실패해도 순위 전체를 실패시키지 않는다.
    return null;
  }
}

/** 비교용으로 제목에서 흔한 구두점 차이(&, :, · 등)와 공백을 없앤다 */
function normalizeTitle(s) {
  return s.replace(/[&:·\-.,!?"'()]/g, '').replace(/\s+/g, '').trim();
}

/**
 * KMDb는 영화명으로 검색하면 동명이인 영화가 여러 편 섞여 나온다(예: "호프"로
 * 검색하면 2019년 노르웨이 영화·1951년 오페라 영화까지 나옴). 제목이 (구두점
 * 차이를 무시하고) 정확히 같은 것만 후보로 삼고, 그중에서도 KOBIS 개봉연도와
 * 2년 이상 차이나면 버린다 — 동명이인일 뿐 실제로는 다른 영화일 가능성이 커서다.
 * 잘못된 포스터를 붙이는 것보다는 포스터 없이 두는 게 낫다.
 *
 * listCount는 넉넉히 잡는다. KMDb는 관련도순이 아니라 다른 기준으로 정렬돼서
 * "군체"처럼 흔한 단어는 옛 뉴스릴·다큐 수십 건이 앞에 나오고 정작 찾는 영화는
 * 40~50번째에 있기도 했다(실측: listCount=10으로는 놓쳤던 영화가 100이면 잡힘).
 */
async function fetchPoster(name, releaseYear) {
  if (!KMDB_KEY) return null;
  const url =
    'http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp' +
    `?collection=kmdb_new2&detail=Y&listCount=100&title=${encodeURIComponent(name)}&ServiceKey=${KMDB_KEY}`;
  try {
    const res = await fetchWithRetry(url, 2, 3000);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.Data?.[0]?.Result ?? [];
    const target = normalizeTitle(name);
    const candidates = results
      .map((r) => ({
        ...r,
        cleanTitle: r.title.replace(/!HS|!HE/g, '').replace(/\s+/g, ' ').trim(),
      }))
      .filter((r) => normalizeTitle(r.cleanTitle) === target && r.posters)
      .filter((r) => Math.abs(Number(r.prodYear) - releaseYear) <= 2);
    if (candidates.length === 0) return null;
    candidates.sort(
      (a, b) => Math.abs(Number(a.prodYear) - releaseYear) - Math.abs(Number(b.prodYear) - releaseYear),
    );
    const first = candidates[0].posters.split('|')[0]?.trim();
    return first || null;
  } catch {
    // 포스터 하나 실패해도 순위 전체를 실패시키지 않는다.
    return null;
  }
}

async function main() {
  const targetDt = yesterday();
  const url =
    'https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json' +
    `?key=${KEY}&targetDt=${targetDt}`;

  let res;
  try {
    res = await fetchWithRetry(url, 3, 5000);
  } catch (err) {
    // 재시도까지 다 실패하면 원인을 최대한 자세히 남긴다.
    console.error('fetch 자체가 실패했습니다(재시도 포함):', err.message);
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

  let prev = null;
  if (existsSync(OUT)) {
    prev = JSON.parse(readFileSync(OUT, 'utf-8'));
    // 순위도 같고 상세정보(감독 등)도 이미 붙어있으면 다시 부를 필요가 없다.
    // 상세정보 필드가 없는 옛 파일이면(스키마 추가 전) 순위가 같아도 한 번은 채워준다.
    const hasDetails = Boolean(prev.movies?.[0]?.directors);
    if (hasDetails && rankingOf(prev.movies) === rankingOf(movies)) {
      console.log(`박스오피스 순위 변동 없음 — 갱신 생략 (기준일 ${targetDt})`);
      return;
    }
  }

  const prevByCd = new Map((prev?.movies ?? []).map((m) => [m.movieCd, m]));
  const moviesWithDetails = [];
  for (const m of movies) {
    // 이미 상세정보를 받아둔 영화면 재조회하지 않는다(API 호출 절약).
    const cached = prevByCd.get(m.movieCd);
    const details =
      cached && cached.directors ? pickDetails(cached) : await fetchMovieInfo(m.movieCd);
    const releaseYear = Number((m.openDate || '').slice(0, 4)) || new Date().getFullYear();
    // 포스터는 "찾은 것"만 캐시한다. null까지 캐시하면(=== undefined 검사) 한 번
    // 실패한 영화는 영영 재시도되지 않는다 — 개봉 직후라 KMDb 등록이 늦은 영화가
    // 나중에 등록돼도 계속 빈 채로 남는 문제가 있었다.
    const posterUrl = cached?.posterUrl || (await fetchPoster(m.name, releaseYear));
    moviesWithDetails.push({ ...m, ...(details ?? {}), posterUrl });
  }

  const out = {
    targetDate: targetDt,
    fetchedAt: new Date().toISOString(),
    movies: moviesWithDetails,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`박스오피스 ${movies.length}건 저장: ${OUT} (기준일 ${targetDt})`);

  // 포스터 누락은 조용히 지나가면 알아채기 어렵다(캐시된 옛 영화는 멀쩡해 보여서
  // 새로 진입한 영화만 빈 걸 놓치기 쉽다). 실행 로그에 요약을 남긴다.
  const missing = moviesWithDetails.filter((m) => !m.posterUrl);
  if (missing.length > 0) {
    console.warn(
      `포스터 없음 ${missing.length}/${moviesWithDetails.length}건: ${missing.map((m) => m.name).join(', ')}`,
    );
    if (!KMDB_KEY) console.warn('→ KMDB_API_KEY가 설정되지 않았습니다. 이게 원인일 수 있습니다.');
  }
}

function pickDetails(m) {
  return {
    directors: m.directors,
    actors: m.actors,
    genres: m.genres,
    watchGrade: m.watchGrade,
    runtime: m.runtime,
    nations: m.nations,
  };
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
