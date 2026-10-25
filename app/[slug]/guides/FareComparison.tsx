import { withOpenGraphUrl } from '@/lib/metadata';
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

export const fareComparisonMetadata: Metadata = withOpenGraphUrl({
  title: 'CGV·롯데시네마·메가박스 관람료 비교',
  description:
    '전국 영화관 공식 요금표에서 일반관 2D 성인 요금을 같은 기준으로 정리했습니다. 브랜드별 평일·주말 요금, 지점별 범위, 시간대와 지역 차이를 확인할 수 있습니다.',
  alternates: { canonical: PATH },
});

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
      <p className="guide-lead">전국 {comparable}개 지점의 공식 요금표에서 비교 가능한 일반관 2D 성인 요금을 같은 기준으로 정리했습니다. 브랜드별 대표 금액뿐 아니라 같은 브랜드 안에서의 지점 간 요금 편차, 시간대·좌석 등급 구분 방식을 함께 비교할 수 있습니다.</p>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차 가이드</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·예매 가이드</Link></li>
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
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            전국 대다수 지점의 일반관 2D 성인 대표 관람료는 세 브랜드 모두 <strong>평일 14,000원, 주말 15,000원</strong>으로 형성되어 있습니다. 즉 브랜드 간 기본 요금 차이는 크지 않지만, 아래 표에서 확인할 수 있듯 <strong>같은 브랜드 안에서도 어느 지점을 방문하느냐에 따라 기본 관람료 차이가 훨씬 크게 발생</strong>합니다.
          </p>
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
        <div className="prose" style={{ marginTop: 16 }}>
          <h3>같은 브랜드인데도 지점마다 요금이 다른 3가지 이유</h3>
          <ul>
            <li>
              <strong>기본 상영관 좌석의 고급화(리클라이너·컴포트 전환)</strong>: 일반 직물 좌석 상영관을 없애고 전 상영관을 리클라이너석이나 컴포트관(COMFORT by MEGA)으로 리뉴얼한 지점은 해당 상영관이 곧 기본관이 되어 시작 요금이 다르게 책정됩니다.
            </li>
            <li>
              <strong>지역 상권 및 입점 형태 차이</strong>: 대도시 핵심 상권이나 복합쇼핑몰 입점 지점과 지방 중소도시·군 단위 지점 간에는 지역 물가와 운영 방식에 따라 평일 기본 요금이 1,000원~4,000원가량 차이 나는 경우가 있습니다.
            </li>
            <li>
              <strong>동일 상영관 내 좌석 등급 세분화</strong>: 롯데시네마와 메가박스 일부 지점은 같은 일반관 안에서도 일반석·스페셜석·커플석·리클라이너석으로 구역을 나누어 좌석 위치와 형태에 따라 다른 금액을 적용합니다.
            </li>
          </ul>
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
        <p className="section-kicker" style={{ marginTop: 12 }}>
          조조·심야 시간대 적용 기준과 청소년·경로·장애인 우대 할인, 문화가 있는 날 상세 규칙은 <Link className="guide-inline-link" href={guidePath(GUIDES.discounts)}>할인·예매 가이드</Link>에서 확인할 수 있습니다.
        </p>
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
          {insight.levelSidos.length > 0 && (
            <p className="section-kicker" style={{ marginTop: 10 }}>
              반면 <strong>{insight.levelSidos.join(', ')}</strong> 지역은 3사 모두 평일 일반 2D 성인 대표 요금이 동일하게 형성되어 있습니다.
            </p>
          )}
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

      <section className="section" aria-labelledby="fare-faq">
        <h2 id="fare-faq">관람료 비교 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>CGV·롯데시네마·메가박스 중 기본 관람료가 가장 낮은 브랜드는 어디인가요?</dt>
            <dd>
              전국 대표 요금(최빈값) 기준으로는 세 브랜드 모두 평일 2D 일반관 성인 14,000원, 주말 15,000원으로 동일합니다. 다만 브랜드 차이보다 방문하려는 개별 지점의 상영관 구성(일반석 vs 리클라이너·컴포트석)과 시간대(조조·모닝·브런치·일반)에 따른 가격 차이가 더 큽니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>조조(모닝) 할인을 받으면 일반 시간대보다 얼마나 절약되나요?</dt>
            <dd>
              전국 지점 요금표 집계 결과 평일 일반 시간대 성인 요금과 조조(모닝) 요금의 차액 중앙값은 {won(insight.morningDiscount)}입니다. 지점과 상영관 종류에 따라 3,000원에서 5,000원까지 차이가 납니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>어린이·청소년 요금은 몇 세까지 적용되나요?</dt>
            <dd>
              일반적으로 만 7세~만 18세(초·중·고등학생) 관람객에게 청소년 요금이 적용되며, 평일 일반관 기준 성인보다 2,000원~4,000원 낮게 책정되어 있습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>같은 지점인데도 예매할 때 좌석마다 가격이 다르게 나오는 이유는 무엇인가요?</dt>
            <dd>
              롯데시네마와 메가박스 일부 상영관, 그리고 CGV 일부 특별관·리클라이너관은 한 상영관 안에 일반석·스페셜석·커플석·모션석 등 여러 좌석 등급을 함께 배치해 좌석 종류별로 다른 요금을 적용하기 때문입니다.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">비교 기준</h2>
        <p className="guide-copy">CGV의 일반(2D), 롯데시네마의 2D 일반석, 메가박스의 일반 2D를 같은 기준으로 맞췄습니다. 일반관이 없는 지점은 리클라이너·컴포트 등 해당 지점의 기본 상영관을 사용했으며, 평일 일반 시간대 성인 요금을 기준선으로 삼았습니다. 심야·브런치처럼 일부 브랜드나 일부 지점에만 있는 시간대는 공통 기준에서 제외했습니다.</p>
        <p className="section-kicker">요금 확인일 {meta.checkedAt} · 전국 {meta.totalBranches}개 지점 중 {comparable}곳 비교</p>
      </section>
    </div>
  );
}
