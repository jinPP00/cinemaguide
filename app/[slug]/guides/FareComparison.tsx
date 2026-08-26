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
    '전국 영화관 공식 요금표에서 일반관 2D 성인 요금을 같은 기준으로 정리했습니다. 브랜드별 평일·주말 요금, 지점별 범위, 시간대와 지역 차이를 확인할 수 있습니다.',
  alternates: { canonical: PATH },
};

export default function FareComparisonPage() {
  const national = brandFareSummaries();
  const insight = fareInsight();
  const extremes = fareExtremes().sort((a, b) => b.spread - a.spread);
  const comparable = comparableBranchCount();
  const slotProfiles = brandProfiles().filter((p) => p.commonSlots.length > 0);
  const pricedScreens = screenStats()
    .filter((s) => s.extraHigh != null && s.sampleSize >= 3)
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
          <li><Link href="/">홈</Link></li>
          <li>관람료 비교</li>
        </ol>
      </nav>

      <h1>CGV·롯데시네마·메가박스 관람료 비교</h1>
      <p className="guide-lead">전국 {comparable}개 지점의 공식 요금표에서 비교 가능한 일반관 2D 성인 요금을 같은 기준으로 정리했습니다.</p>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화순위</Link></li>
      </ul>

      <section className="section" aria-labelledby="baseline">
        <h2 id="baseline">3사 일반관 2D 요금</h2>
        <p className="section-kicker">일반 시간대 성인 기준이며, 대표 요금은 해당 브랜드 지점에서 가장 많이 확인된 금액입니다.</p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">평일 대표</th>
                <th scope="col">주말 대표</th>
                <th scope="col">평일 지점 범위</th>
              </tr>
            </thead>
            <tbody>
              {national.map((row) => (
                <tr key={row.brand}>
                  <th scope="row">{row.brandName}<span className="subline">비교 {row.count}곳</span></th>
                  <td>{won(row.weekdayCommon)}</td>
                  <td>{won(row.weekendCommon)}</td>
                  <td>{won(row.weekdayLow)} ~ {won(row.weekdayHigh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="branch-range">
        <h2 id="branch-range">브랜드별 지점 요금 범위</h2>
        <p className="section-kicker">평일 일반 시간대 성인 기준입니다. 일반관이 없는 지점은 해당 지점의 기본 상영관 요금을 사용하고 상영관명을 함께 표시합니다.</p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">최저 요금 지점</th>
                <th scope="col">최고 요금 지점</th>
                <th scope="col">범위</th>
              </tr>
            </thead>
            <tbody>
              {extremes.map((row) => (
                <tr key={row.brand}>
                  <th scope="row">{row.brandName}</th>
                  <td className="text">
                    <Link className="guide-inline-link" href={branchPath(row.cheapest.branch)}>{row.cheapest.branch.name}</Link> · {won(row.cheapest.adult)}
                    <span className="subline">{row.cheapest.label}</span>
                  </td>
                  <td className="text">
                    <Link className="guide-inline-link" href={branchPath(row.priciest.branch)}>{row.priciest.branch.name}</Link> · {won(row.priciest.adult)}
                    <span className="subline">{row.priciest.label}</span>
                  </td>
                  <td>{won(row.spread)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="time-gap">
        <h2 id="time-gap">시간대와 주말 요금</h2>
        <div className="fact-grid cols-2">
          <div className="fact-card">
            <span className="fact-label">조조와 평일 일반 시간대 차액</span>
            <span className="fact-value">중앙값 {won(insight.morningDiscount)}</span>
            <span className="fact-meta">CGV는 모닝, 롯데시네마·메가박스는 조조로 표기합니다.</span>
          </div>
          <div className="fact-card">
            <span className="fact-label">주말과 평일 일반 시간대 차액</span>
            <span className="fact-value">중앙값 {won(insight.weekendPremium)}</span>
            <span className="fact-meta">지점별 실제 금액은 각 지점 요금표에서 확인할 수 있습니다.</span>
          </div>
        </div>
        <div className="data-table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">조조 표기</th>
                <th scope="col">주요 시간대 구분</th>
              </tr>
            </thead>
            <tbody>
              {slotProfiles.map((p) => (
                <tr key={p.brand}>
                  <th scope="row">{p.brandName}</th>
                  <td>{MORNING_SLOT[p.brand]}</td>
                  <td>{p.commonSlots.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {insight.splitSidos.length > 0 && (
        <section className="section" aria-labelledby="region-gap">
          <h2 id="region-gap">지역별 브랜드 요금 차이</h2>
          <p className="section-kicker">같은 시도 안에서 브랜드별 대표 요금이 다른 지역만 표시합니다. 브랜드별 지점이 3곳 미만인 지역은 제외했습니다.</p>
          <div className="data-table-shell">
            <table className="data-table data-table--fare">
              <thead>
                <tr>
                  <th scope="col">지역</th>
                  <th scope="col">낮은 요금</th>
                  <th scope="col">높은 요금</th>
                  <th scope="col">차이</th>
                </tr>
              </thead>
              <tbody>
                {insight.splitSidos.map((row) => (
                  <tr key={row.sido}>
                    <th scope="row">{row.sido}</th>
                    <td>{row.cheapest.brandName} · {won(row.cheapest.weekdayCommon)}</td>
                    <td>{row.priciest.brandName} · {won(row.priciest.weekdayCommon)}</td>
                    <td>{won(row.gap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pricedScreens.length > 0 && (
        <section className="section" aria-labelledby="screen-gap">
          <h2 id="screen-gap">특별관 추가요금</h2>
          <p className="section-kicker">같은 지점의 기본관 평일 일반 시간대 성인 요금과 비교한 값입니다. 요금 확인 지점이 3곳 이상인 특별관만 표시합니다.</p>
          <div className="data-table-shell">
            <table className="data-table data-table--fare">
              <thead>
                <tr>
                  <th scope="col">상영관</th>
                  <th scope="col">브랜드</th>
                  <th scope="col">운영 지점</th>
                  <th scope="col">추가요금</th>
                </tr>
              </thead>
              <tbody>
                {pricedScreens.slice(0, 8).map((screen) => (
                  <tr key={screen.kind.name}>
                    <th scope="row">{screen.kind.name}</th>
                    <td className="text">{screen.brandNames.join(' · ')}</td>
                    <td>{screen.branchCount}곳</td>
                    <td>{formatExtra(screen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="section-kicker">운영 지점과 상영 방식 설명은 <Link className="guide-inline-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link>에서 확인할 수 있습니다.</p>
        </section>
      )}

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">비교 기준</h2>
        <p className="guide-copy">CGV의 일반(2D), 롯데시네마의 2D 일반석, 메가박스의 일반 2D를 같은 기준으로 맞췄습니다. 일반관이 없는 지점은 리클라이너·컴포트 등 해당 지점의 기본 상영관을 사용했으며, 평일 일반 시간대 성인 요금을 기준선으로 삼았습니다. 심야·브런치처럼 일부 브랜드나 일부 지점에만 있는 시간대는 공통 기준에서 제외했습니다.</p>
        <p className="section-kicker">요금 확인일 {meta.checkedAt} · 전국 {meta.totalBranches}개 지점 중 {comparable}곳 비교</p>
      </section>
    </div>
  );
}
