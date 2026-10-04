# 영화관 지점안내

CGV·롯데시네마·메가박스 전국 425개 지점의 위치, 교통, 주차, 관람료 정보를 정리한 비공식 정보 안내 사이트.

각 영화관 공식 서비스와 무관하며, 실시간 상영시간표는 제공하지 않고 공식 예매 페이지로 연결한다.

## 기술 구성

| 항목 | 값 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 렌더링 | 정적 생성 (`output: 'export'`) |
| 호스팅 | Cloudflare Workers Static Assets |
| 데이터 | 빌드 시점에 `data/*.json`을 읽어 정적 페이지 생성 |

본문은 빌드 결과물인 HTML·CSS·JS로 제공한다. HTTP→HTTPS는 Cloudflare 도메인의 SSL/TLS → Edge Certificates → Always Use HTTPS 설정을 켜서 처리한다. www의 대표 주소 이동은 기존 도메인 설정을 사용한다.

정적 자산에는 Worker 스크립트를 두지 않는다. `assets.run_worker_first: true`를 추가하면 HTML·JS·CSS뿐 아니라 Next.js 화면 전환용 `.txt` 요청도 모두 Worker 실행으로 집계되어 무료 일일 요청 한도를 소모한다. 요청량 때문에 런타임이 꼭 필요해지면 실행할 경로부터 제한한다.

운영 배포는 `.github/workflows/deploy-cloudflare.yml`의 `wrangler deploy`를 사용한다. 아래 Pages 설정은 다른 정적 호스팅으로 옮길 때 참고용이다.

## Cloudflare Pages 배포 설정

GitHub 저장소를 연결할 때 아래 값을 사용한다.

| 설정 | 값 |
|---|---|
| Framework preset | Next.js (Static HTML Export) 또는 None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | 20 이상 |

환경 변수(선택):

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical·sitemap에 쓰이는 사이트 주소. 미설정 시 `https://cinemaguide.kr` |

## 명령어

```bash
npm install

npm run dev          # 개발 서버
npm run build        # 최신 llms.txt 생성 + 정적 사이트 빌드 → out/
npm run check        # 빌드 + SEO 회귀 테스트 + 링크·본문·검색 메타 검사
npm run test:seo     # 한국 집계일·일별 수치 갱신 회귀 테스트

npm run data         # 크롤링 원본 → data/*.json 재생성 + 검증
```

## 데이터 갱신

지점 정보와 요금은 별도 크롤링 저장소(`../cinema-chains/`)의 원본에서 생성한다.
원본을 갱신한 뒤 아래를 실행하면 `data/*.json`이 다시 만들어진다.

```bash
npm run data
```

`scripts/normalize.mjs`가 하는 일:

- 3사의 서로 다른 필드·지역 분류를 공통 스키마로 통일
- 주소를 파싱해 표준 17개 시도로 정규화
- 요금표를 `{라벨, 시간대, 평일·주말, 성인·청소년·경로·장애인}` 형태로 평탄화
- `(휴관)` 표기를 지점명에서 분리해 `status`로 이동
- 좌표가 없는 브랜드는 길찾기 링크 URL에서 위경도 추출

`scripts/verify.mjs`가 결과를 24개 항목으로 검사한다. 실패하면 종료 코드 1.

갱신 주기 기준: 지점 목록·주소 6개월 / 교통·주차 3개월 / 관람료 1~3개월.

박스오피스는 매주 월요일 KST 09:00에 한국 날짜 기준 어제 집계를 조회한다. 영화 순서가 같아도 집계일·관객 수·점유율이 바뀌면 저장하며, 조회 실패 시 기존 파일을 보존하고 워크플로를 실패로 표시한다. 데이터와 `llms.txt`를 함께 커밋하고, 커밋 뒤에는 배포 워크플로를 직접 호출한다. 배포 전에는 데이터 검증·SEO 회귀 테스트·내부 링크·지점 본문·사이트 검색 메타 검사를 통과해야 한다.

박스오피스 페이지의 `dateModified`와 사이트맵 `lastmod`는 `boxoffice.fetchedAt`을 공유한다. 지점 페이지의 확인일에는 이 값을 섞지 않는다. `public/llms.txt`는 빌드마다 실제 집계일·지점 수를 반영한다.

SEO 수정 배포 후 14일에 Google Search Console·Bing Webmaster Tools·네이버 서치어드바이저에서 색인 상태와 최근 28일 노출·클릭을 비교한다. 사이트맵은 `https://cinemaguide.kr/sitemap.xml`이다. 소유 확인 태그가 있다는 것만으로 등록·사이트맵 제출 완료를 판단하지 않는다. AI 인용은 같은 질문·검색 모드·기준일로 실제 출처 URL을 기록한다.

## 구조

```
app/
  page.tsx                       홈 (브랜드 선택 · 안내 페이지 진입)
  [slug]/page.tsx                브랜드 허브 · 지점 상세 · 안내 페이지를 모두 맡는 라우트
  [slug]/[sido]/page.tsx         시도별 지점 목록
  [slug]/guides/                 안내 페이지 본문
    FareComparison.tsx             /관람료비교/
    SpecialScreens.tsx             /특별관/
    BoxOfficeGuide.tsx             /박스오피스/
  [slug]/NearbySection.tsx       지점 상세 — 근처 다른 영화관
  [slug]/SpecialScreenSection.tsx 지점 상세 — 특별관 추가요금
  about · contact · privacy · terms · disclaimer · affiliate-disclosure
  sitemap.ts · robots.ts
lib/
  data.ts     데이터 조회와 URL 생성
  paths.ts    경로 헬퍼 (데이터 import 없음 — 클라이언트 컴포넌트용)
  fares.ts    3사 요금표를 비교 가능한 형태로 맞추는 계산
  screens.ts  특별관 분류와 추가요금 집계
  geo.ts      좌표 기반 인근 지점 계산
  josa.ts     한국어 조사 자동 선택
  types.ts    공통 타입
  site.ts     사이트 상수 (도메인·운영자·이메일)
  legal.ts    정책 문서 플래그
  content.ts  브랜드·지역 소개 문구
scripts/      normalize · verify · check-links
data/         빌드 입력 (커밋 대상)
```

**한글 경로는 정적 라우트로 만들 수 없다.**
`app/특별관/page.tsx`처럼 한글 폴더로 라우트를 만들면 `next build`의 export
단계가 `InvalidCharacterError`로 죽는다(Next 16.2 확인). `[slug]` 동적 세그먼트는
같은 한글 경로를 정상 처리하므로, 안내 페이지는 `app/[slug]/page.tsx`의
`GUIDE_PAGES`에 등록해서 연결한다.

## 주의사항

**URL은 한글을 쓴다.** (`/cgv/서울/강남/`)
링크를 직접 문자열로 조합하지 말고 `lib/data.ts`의 `brandPath`·`sidoPath`·`branchPath`를 쓴다.
인코딩 형태가 섞이면 같은 페이지가 다른 URL로 취급돼 중복 색인 문제가 생긴다.

**지점 색인 여부는 `lib/data.ts`의 `isIndexable()` 한 곳에서 갈린다.**
지점 상세의 `robots` 설정과 `app/sitemap.ts` 포함 여부가 모두 이 값을 따른다.
기준은 "화면에 '아직 확인하지 못했습니다'가 뜨는 페이지는 색인하지 않는다"
하나이며, 교통·주차·요금이 모두 있어야 색인 대상이 된다(현재 425곳 중 394곳).
원본 데이터가 채워지면 함수를 고치지 않아도 자동으로 색인 대상이 된다.

색인 여부는 **본문 렌더링과 무관하다.** 색인하지 않는 지점도 갖고 있는 정보는
그대로 다 보여주고, 없는 항목만 각 섹션에서 안내문으로 표시된다.

**정책 문서는 실제 운영 상태를 따라간다.**
`lib/legal.ts`의 `usesAnalytics`·`usesAds` 플래그가 `false`인 동안
개인정보처리방침에는 "쿠키를 사용하지 않는다"고 표기된다.
GA4나 애드센스를 도입하면 **먼저 이 플래그를 `true`로 바꿔야** 방침과 실제가 일치한다.
