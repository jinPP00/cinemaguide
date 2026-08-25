import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, branchPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import {
  brandFareSummaries,
  fareInsight,
  fareExtremes,
  brandProfiles,
  MORNING_SLOT,
  won,
} from '@/lib/fares';
import { screenStats, comparableBranchCount, formatExtra } from '@/lib/screens';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';

const PATH = guidePath(GUIDES.fares);

export const fareComparisonMetadata: Metadata = {
  title: 'CGV·롯데시네마·메가박스 관람료 비교',
  description:
    '전국 영화관 요금표를 한자리에 놓고 비교했습니다. 브랜드·지역·시간대·상영관 종류 중 실제로 금액을 좌우하는 것이 무엇인지 지점별 요금 데이터로 확인합니다.',
  alternates: { canonical: PATH },
};

export default function FareComparisonPage() {
  const national = brandFareSummaries();
  const insight = fareInsight();
  const extremes = fareExtremes().sort((a, b) => b.spread - a.spread);
  const widest = extremes[0];
  const comparable = comparableBranchCount();
  // 시간대 구간 수는 지점마다 달라서 문장에 박아둘 수 없다 — CGV만 해도
  // 3구간 115곳, 2구간 55곳, 4구간 2곳이다. 가장 흔한 구성을 데이터에서 찾는다.
  const slotProfiles = brandProfiles().filter((p) => p.commonSlots.length > 0);

  // "상영관 선택이 가장 큰 변수"라는 문장의 근거. 표본이 두 곳뿐인 특별관은
  // 그 지점 사정이 곧 대푯값이 되므로 순위에서 뺀다.
  const pricedScreens = screenStats()
    .filter((s) => s.extraHigh != null && s.extraHigh > 0 && s.sampleSize >= 3)
    .sort((a, b) => b.extraHigh! - a.extraHigh!);

  const crumbs = [
    { name: '홈', path: '/' },
    { name: '관람료 비교', path: PATH },
  ];

  return (
    <div className="wrap page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(PATH, dataGeneratedAt.toISOString()),
        )}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>관람료 비교</li>
        </ol>
      </nav>

      <h1>CGV·롯데시네마·메가박스 관람료 비교</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        세 브랜드의 요금표는 각자 공식 사이트에 따로 있어서 나란히 놓고 보기가 어렵습니다. 전국{' '}
        {comparable}개 지점의 요금표에서 서로 비교할 수 있는 줄만 뽑아 정리했습니다.
      </p>

      <section className="section" aria-labelledby="baseline">
        <h2 id="baseline">전국 기준 요금</h2>
        <p className="card-sub" style={{ marginTop: 4 }}>
          일반 상영관 2D, 일반 시간대, 성인 기준입니다. 가장 흔한 금액과 함께 지점별 최저·최고를
          적었습니다.
        </p>
        <div className="table-scroll" style={{ marginTop: 14 }}>
          <table className="fare-table">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">평일</th>
                <th scope="col">주말</th>
                <th scope="col">지점별 범위(평일)</th>
              </tr>
            </thead>
            <tbody>
              {national.map((row) => (
                <tr key={row.brand}>
                  <th scope="row">
                    {row.brandName}
                    <span className="fare-note"> {row.count}곳</span>
                  </th>
                  <td>{won(row.weekdayCommon)}</td>
                  <td>{won(row.weekendCommon)}</td>
                  <td className="fare-range">
                    {won(row.weekdayLow)} ~ {won(row.weekdayHigh)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="brand-gap">
        <h2 id="brand-gap">브랜드를 바꿔도 요금은 거의 그대로입니다</h2>
        <div className="prose" style={{ marginTop: 12 }}>
          <p>
            세 브랜드의 가장 흔한 평일 요금은 {won(national[0].weekdayCommon)}으로 같습니다.
            {insight.levelSidos.length > 0 && (
              <>
                {' '}
                {insight.levelSidos.join('·')} {insight.levelSidos.length}개 지역은 세 브랜드의
                기준 요금이 완전히 같아서, 어느 브랜드를 고르든 금액이 달라지지 않습니다.
              </>
            )}
          </p>
          <p>
            정작 차이가 큰 쪽은 같은 브랜드 안입니다. {widest.brandName}만 해도 가장 싼{' '}
            <Link href={branchPath(widest.cheapest.branch)}>
              {widest.cheapest.branch.name} 지점 {won(widest.cheapest.adult)}
            </Link>
            과 가장 비싼{' '}
            <Link href={branchPath(widest.priciest.branch)}>
              {widest.priciest.branch.name} 지점 {won(widest.priciest.adult)}
            </Link>
            의 차이가 {won(widest.spread)}입니다. 어느 브랜드를 고르는지보다 어느 지점에 가는지가
            금액을 훨씬 크게 좌우합니다.
          </p>
          <p>
            다만 이 둘은 상영관 자체가 다릅니다. 일반관이 없는 지점은 그 지점에서 가장 기본이
            되는 관을 기준으로 잡았기 때문에, 아래 표에는 어느 관 요금인지 함께 적었습니다.
          </p>
        </div>

        <div className="table-scroll" style={{ marginTop: 16 }}>
          <table className="fare-table">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">가장 싼 지점</th>
                <th scope="col">가장 비싼 지점</th>
                <th scope="col">차이</th>
              </tr>
            </thead>
            <tbody>
              {extremes.map((e) => (
                <tr key={e.brand}>
                  <th scope="row">{e.brandName}</th>
                  <td>
                    <Link href={branchPath(e.cheapest.branch)}>{e.cheapest.branch.name}</Link>{' '}
                    {won(e.cheapest.adult)}
                    <span className="fare-note"> {e.cheapest.label}</span>
                  </td>
                  <td>
                    <Link href={branchPath(e.priciest.branch)}>{e.priciest.branch.name}</Link>{' '}
                    {won(e.priciest.adult)}
                    <span className="fare-note"> {e.priciest.label}</span>
                  </td>
                  <td className="fare-extra">{won(e.spread)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="time-gap">
        <h2 id="time-gap">시간대를 옮기면 {won(insight.morningDiscount)} 차이가 납니다</h2>
        <div className="prose" style={{ marginTop: 12 }}>
          <p>
            아침 첫 회차 할인은 세 브랜드가 모두 운영하는데 부르는 이름이 다릅니다. CGV는{' '}
            {MORNING_SLOT.cgv}, 롯데시네마와 메가박스는 {MORNING_SLOT.lotte}입니다. 할인 폭은
            비슷해서 평일 일반 시간대보다 대체로 {won(insight.morningDiscount)} 쌉니다. 브랜드를
            바꿔서 아낄 수 있는 금액이 사실상 없다는 점을 생각하면, 시간대를 한 칸 옮기는 쪽이
            훨씬 효과가 큽니다.
          </p>
          <p>
            시간대를 몇 구간으로 나누는지도 브랜드마다 다릅니다. 가장 흔한 구성 기준으로{' '}
            {slotProfiles.map((p, i) => (
              <span key={p.brand}>
                {i > 0 && ', '}
                {p.brandName}는 {p.commonSlots.join('·')} {p.commonSlots.length}구간
              </span>
            ))}
            입니다. 주말은 평일보다 대체로 {won(insight.weekendPremium)} 비쌉니다.
          </p>
        </div>
      </section>

      {insight.splitSidos.length > 0 && (
        <section className="section" aria-labelledby="region-gap">
          <h2 id="region-gap">지역에 따라 갈리기도 합니다</h2>
          <p className="card-sub" style={{ marginTop: 4 }}>
            같은 지역인데 브랜드별 기준 요금이 다른 곳입니다. 지점이 3곳 미만인 브랜드는 지역
            대푯값으로 보기 어려워 제외했습니다.
          </p>
          <div className="table-scroll" style={{ marginTop: 14 }}>
            <table className="fare-table">
              <thead>
                <tr>
                  <th scope="col">지역</th>
                  <th scope="col">낮은 쪽</th>
                  <th scope="col">높은 쪽</th>
                  <th scope="col">차이</th>
                </tr>
              </thead>
              <tbody>
                {insight.splitSidos.map((s) => (
                  <tr key={s.sido}>
                    <th scope="row">{s.sido}</th>
                    <td>
                      {s.cheapest.brandName} {won(s.cheapest.weekdayCommon)}
                    </td>
                    <td>
                      {s.priciest.brandName} {won(s.priciest.weekdayCommon)}
                    </td>
                    <td className="fare-extra">{won(s.gap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="card-sub" style={{ marginTop: 14 }}>
            같은 지역 안에서도 지점마다 요금이 다릅니다. 실제 금액은 각 지점 페이지의 요금표에서
            확인하시기 바랍니다.
          </p>
        </section>
      )}

      {pricedScreens.length > 0 && (
        <section className="section" aria-labelledby="screen-gap">
          <h2 id="screen-gap">가장 큰 변수는 상영관 종류입니다</h2>
          <div className="prose" style={{ marginTop: 12 }}>
            <p>
              여기까지 나온 차이는 대부분 {won(insight.morningDiscount)} 안쪽인데, 상영관을 바꾸면
              그보다 크게 움직입니다. 같은 지점 기본관과 비교했을 때 추가요금이 큰 순서입니다.
            </p>
          </div>
          <ul className="chip-list" style={{ marginTop: 14 }}>
            {pricedScreens.slice(0, 8).map((s) => (
              <li key={s.kind.name}>
                <span className="chip">
                  {s.kind.name} {formatExtra(s)}
                </span>
              </li>
            ))}
          </ul>
          <p className="card-sub" style={{ marginTop: 16 }}>
            종류별로 어디에 몇 곳이 있는지는{' '}
            <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>에 정리했습니다.
          </p>
        </section>
      )}

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">비교 기준</h2>
        <div className="prose" style={{ marginTop: 12 }}>
          <p>
            세 브랜드는 같은 것을 다르게 부릅니다. 일반 상영관 2D 성인 요금이 CGV에서는
            &lsquo;일반(2D)&rsquo;, 롯데시네마는 &lsquo;2D 일반석&rsquo;, 메가박스는 &lsquo;일반
            2D&rsquo;입니다. 이 페이지는 각 브랜드에서 여기에 해당하는 줄만 뽑아 비교했습니다.
            일반관 없이 리클라이너관이나 컴포트관만 운영하는 지점은 그 관이 곧 기본관이므로,
            지점 페이지에서 어떤 관을 기준으로 삼았는지 함께 표기합니다.
          </p>
          <p>
            평일 일반 시간대를 기준선으로 잡은 것은 세 브랜드가 공통으로 갖고 있는 유일한
            조합이기 때문입니다. 심야 요금은 일부 지점에만 있고, 브런치는 사실상 CGV에만 있습니다.
          </p>
          <p className="updated">
            요금 확인일 {meta.checkedAt} · 전국 {meta.totalBranches}개 지점 중 {comparable}곳에서
            비교 가능한 요금표를 확인했습니다. 관람료는 수시로 바뀌므로 예매 전 공식 페이지에서
            최종 금액을 확인하시기 바랍니다.
          </p>
        </div>
      </section>
    </div>
  );
}
