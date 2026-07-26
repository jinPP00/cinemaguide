# 영화관 지점안내

CGV·롯데시네마·메가박스 전국 425개 지점의 위치, 교통, 주차, 관람료 정보를 정리한 비공식 정보 안내 사이트.

각 영화관 공식 서비스와 무관하며, 실시간 상영시간표는 제공하지 않고 공식 예매 페이지로 연결한다.

## 기술 구성

| 항목 | 값 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 렌더링 | 정적 생성 (`output: 'export'`) |
| 호스팅 | Cloudflare Pages |
| 데이터 | 빌드 시점에 `data/*.json`을 읽어 정적 페이지 생성 |

서버가 없다. 빌드 결과물은 순수 HTML·CSS·JS이므로 정적 호스팅에 그대로 올라간다.

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
npm run build        # 정적 사이트 빌드 → out/
npm run check        # 빌드 + 깨진 내부 링크 검사

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

## 구조

```
app/
  page.tsx                          홈 (브랜드 선택)
  [brand]/page.tsx                  브랜드 허브
  [brand]/[sido]/page.tsx           시도별 지점 목록
  [brand]/[sido]/[branch]/page.tsx  지점 상세
  about · contact · privacy · terms · disclaimer · affiliate-disclosure
  sitemap.ts · robots.ts
lib/
  data.ts     데이터 조회와 URL 생성
  types.ts    공통 타입
  site.ts     사이트 상수 (도메인·운영자·이메일)
  legal.ts    정책 문서 플래그
  content.ts  브랜드·지역 소개 문구
scripts/      normalize · verify · check-links
data/         빌드 입력 (커밋 대상)
```

## 주의사항

**URL은 한글을 쓴다.** (`/cgv/서울/강남/`)
링크를 직접 문자열로 조합하지 말고 `lib/data.ts`의 `brandPath`·`sidoPath`·`branchPath`를 쓴다.
인코딩 형태가 섞이면 같은 페이지가 다른 URL로 취급돼 중복 색인 문제가 생긴다.

**지점 페이지 425개는 현재 `noindex`다.**
교통·주차·요금 본문이 아직 비어 있어 검색엔진에 색인시키지 않는다.
내용을 채운 뒤 `app/[brand]/[sido]/[branch]/page.tsx`의 `robots` 설정을 제거하고
`app/sitemap.ts`에 지점 URL을 추가한다.

**정책 문서는 실제 운영 상태를 따라간다.**
`lib/legal.ts`의 `usesAnalytics`·`usesAds` 플래그가 `false`인 동안
개인정보처리방침에는 "쿠키를 사용하지 않는다"고 표기된다.
GA4나 애드센스를 도입하면 **먼저 이 플래그를 `true`로 바꿔야** 방침과 실제가 일치한다.
