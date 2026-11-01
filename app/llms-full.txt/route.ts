import { meta, operatingBranches, isIndexable, isOperating, sidosOfBrand, branchesOfBrand } from '@/lib/data';
import { baseFare, brandProfiles, fareInsight, won } from '@/lib/fares';
import { parkingGroups } from '@/lib/parking';
import { specialScreenBranchCount } from '@/lib/screens';
import { branchPath, brandPath, guidePath, GUIDES } from '@/lib/paths';
import { REGION_GROUPS } from '@/lib/regions';
import { dataGeneratedAt } from '@/lib/dates';
import { SITE } from '@/lib/site';

/**
 * llms.txt의 상세판. AI 검색이 지점별 사실(주소·대표 요금·관람객 주차)을 페이지를
 * 하나씩 열지 않고도 인용할 수 있게 한 줄씩 적는다. 화면과 같은 계산 함수를 쓰므로
 * 숫자가 지점 페이지와 어긋나지 않는다. 색인하지 않는 지점(정보 부족·영업 종료)은 뺀다.
 */
export const dynamic = 'force-static';

export function GET() {
  const base = SITE.url.replace(/\/$/, '');
  const url = (path: string) => `${base}${path}`;
  const insight = fareInsight();
  const profiles = brandProfiles();
  const listed = operatingBranches.filter(isIndexable);

  const brandLines = meta.brands.map((b) => {
    const p = profiles.find((x) => x.brand === b.key);
    // 브랜드 페이지와 같은 기준: 운영 중인 지점만 센다
    const special = branchesOfBrand(b.key).filter((x) => isOperating(x) && x.specialScreens.length > 0).length;
    return `- [${b.name}](${url(brandPath(b.segment))}): 지점 ${b.count}곳, ${sidosOfBrand(b.key).length}개 시도, 특별관 보유 ${special}곳${
      p?.weekdayCommon != null ? `, 일반관 2D 성인 평일 대표 요금 ${won(p.weekdayCommon)}` : ''
    }${p ? `, 요금 시간대 ${p.commonSlots.join('·')}` : ''}`;
  });

  const branchLine = (b: (typeof listed)[number]) => {
    const fare = baseFare(b);
    const groups = parkingGroups(b);
    const free = groups.find((g) => g.label === '무료 주차')?.items[0];
    const extra = groups.find((g) => g.label === '초과 요금')?.items[0];
    const parts = [
      b.address,
      fare ? `${fare.label} 성인 평일 ${won(fare.weekdayAdult)}·주말 ${won(fare.weekendAdult)}` : null,
      free ? `관람객 주차 ${free}${extra ? `, 초과 ${extra}` : ''}` : null,
      b.specialScreens.length > 0 ? `특별관 ${b.specialScreens.join(', ')}` : null,
      `확인일 ${b.checkedAt}`,
    ].filter(Boolean);
    return `- [${b.name} ${b.brandName}](${url(branchPath(b))}): ${parts.join(' · ')}`;
  };

  const regionSections = REGION_GROUPS.flatMap((region) =>
    region.sidos.map((sido) => {
      const list = listed.filter((b) => b.sido === sido);
      if (list.length === 0) return '';
      return `### ${sido} (${list.length}곳)\n\n${list.map(branchLine).join('\n')}`;
    }),
  ).filter(Boolean);

  const body = `# ${SITE.name} — 상세 자료

> CGV·롯데시네마·메가박스 지점의 주소, 대표 관람료, 관람객 주차 조건을 지점마다 한 줄로 적은 문서예요. 요약판은 ${url('/llms.txt')}에 있어요.

- 자료 생성일: ${dataGeneratedAt.toISOString().slice(0, 10)} · 전국 ${meta.totalBranches}개 지점 중 정보가 갖춰진 ${listed.length}곳을 실었어요.
- 출처: 각 브랜드 공식 홈페이지의 지점 안내. 지점마다 확인일을 함께 적었어요.
- 이 사이트는 영화관 브랜드의 공식 서비스가 아니에요. 상영시간표와 예매는 각 브랜드 공식 사이트에서 제공해요.
- 인용할 때는 지점 페이지 URL과 확인일을 함께 적어 주세요. 요금과 주차 조건은 바뀔 수 있어요.

## 세 브랜드 요약

${brandLines.join('\n')}

- 평일 조조(모닝) 성인 요금은 평일 일반 시간대보다 지점별 중앙값으로 ${won(insight.morningDiscount)} 낮고, 주말 일반 시간대는 평일보다 ${won(insight.weekendPremium)} 높아요.
- 특별관(IMAX·4DX·SCREENX·돌비 등)이 있는 지점은 ${specialScreenBranchCount()}곳이에요.

## 이용 안내 페이지

- [관람료 비교](${url(guidePath(GUIDES.fares))}): 브랜드·지역·시간대별 일반관 2D 성인 요금과 지점별 요금 범위
- [특별관](${url(guidePath(GUIDES.screens))}): 상영 방식별 특별관 목록, 있는 지점, 기본관 대비 추가 요금
- [주차](${url(guidePath(GUIDES.parking))}): 브랜드별 무료 주차 조건, 인증 방법 네 가지, 백화점·쇼핑몰 영수증 합산
- [할인·우대](${url(guidePath(GUIDES.discounts))}): 조조·심야 요금, 청소년·경로·장애인 우대 대상과 증빙, 문화가 있는 날
- [영화 순위](${url(guidePath(GUIDES.boxoffice))}): 영화진흥위원회(KOBIS) 집계 박스오피스, 매주 월요일 갱신

## 지점 목록

${regionSections.join('\n\n')}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
