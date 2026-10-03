import { readFileSync, writeFileSync } from 'node:fs';

const load = file => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const meta = load('data/meta.json');
const boxoffice = load('public/boxoffice.json');
const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cinemaguide.kr').replace(/\/$/, '');
const link = slug => `${base}/${encodeURIComponent(slug)}/`;
const date = boxoffice.targetDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
const content = `# 영화관 지점안내

> CGV·롯데시네마·메가박스 전국 ${meta.totalBranches}개 지점의 위치, 교통, 주차, 관람료 정보를 정리한 비공식 안내 사이트.

이 사이트는 각 영화관 브랜드의 공식 서비스와 무관합니다. 예매·결제·실시간 상영시간표는 직접 제공하지 않고 각 지점의 공식 상영시간표로 연결합니다.

## 핵심 안내

- [관람료 비교](${link('관람료비교')}): 공식 요금표에서 일반관 2D 성인 요금을 같은 기준으로 비교합니다. 대상 지점·평일/주말·시간대·확인일을 본문에서 확인할 수 있습니다.
- [전국 특별관 안내](${link('특별관')}): IMAX·4DX·SCREENX·돌비 계열 등 상영 방식과 운영 지점을 정리합니다.
- [박스오피스 순위](${link('박스오피스')}): KOBIS 일별 관객 수 기준 순위. 현재 집계일 ${date}, 매주 월요일 갱신하는 스냅샷입니다.

## 브랜드별 지점 안내

${meta.brands.map(b => `- [${b.name} 전국 지점 안내](${link(b.segment)}): ${b.count}개 지점의 주소·교통·주차·관람료와 공식 상영시간표 링크`).join('\n')}

지점별 canonical URL은 [사이트맵](${base}/sitemap.xml)에서 확인할 수 있습니다. 데이터가 부족하거나 영업 종료된 지점은 검색 색인에서 제외될 수 있습니다.

## 데이터 정책

- 지점 자료는 각 브랜드 공식 홈페이지의 공개 정보를 정규화합니다. 각 지점의 정보 확인일과 원문 링크가 본문에 있습니다.
- 요금 비교는 페이지에 명시한 일반관·좌석·시간대 기준으로 자체 집계합니다. 전체 지점 수와 비교 가능한 지점 수는 다를 수 있습니다.
- 박스오피스 원출처는 [영화진흥위원회 KOBIS](https://www.kobis.or.kr/)이며 영화 상세정보·포스터는 [한국영상자료원 KMDb](https://www.kmdb.or.kr/) 자료를 사용합니다.
- 박스오피스는 실시간 데이터가 아닙니다. 집계일 이후의 변동은 반영되지 않으며 갱신에 실패하면 기존 집계일을 유지합니다.
- 인용할 때는 해당 페이지 URL과 정보 확인일 또는 집계일을 함께 표기하세요. 방문·결제 전 요금과 주차 조건은 공식 채널에서 재확인해야 합니다.

## 운영 정보

- [사이트 소개](${base}/about/): 운영 목적, 수집·확인 방법, 갱신 주기
- [문의·정정 요청](${base}/contact/)
- [개인정보처리방침](${base}/privacy/)
- [이용약관](${base}/terms/)
`;

writeFileSync(new URL('../public/llms.txt', import.meta.url), content);
console.log(`llms.txt 갱신: ${meta.totalBranches}개 지점, 박스오피스 ${date}`);
