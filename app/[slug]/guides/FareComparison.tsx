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
    'CGV·롯데시네마·메가박스 공식 요금표에서 일반관 2D 성인 요금을 모아 비교했습니다. 브랜드별 평일·주말 요금, 지점별 요금 범위, 시간대·지역별 차이.',
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
      <p className="guide-lead">{comparable}개 지점의 공식 요금표에서 일반관 2D 성인 요금을 뽑아 비교했습니다. 브랜드끼리는 거의 같고, 차이는 같은 브랜드 안의 지점 사이와 시간대에서 납니다.</p>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·우대</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화 순위</Link></li>
      </ul>

      <section className="section" aria-labelledby="baseline">
        <h2 id="baseline">3사 일반관 2D 요금</h2>
        <p className="section-kicker">일반 시간대, 성인 기준입니다. 대표 요금은 그 브랜드 지점에서 가장 흔한 금액입니다.</p>
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
                  <td className="num">{won(row.weekdayCommon)}</td>
                  <td className="num">{won(row.weekendCommon)}</td>
                  <td className="num">{won(row.weekdayLow)} ~ {won(row.weekdayHigh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="guide-copy">
          세 브랜드 모두 대부분의 지점이 <strong>평일 14,000원, 주말 15,000원</strong>입니다. 브랜드를 바꾼다고
          요금이 크게 달라지지는 않습니다. 오히려 같은 브랜드 안에서 어느 지점에 가느냐에 따라 차이가 더 큽니다.
        </p>
      </section>

      <section className="section" aria-labelledby="branch-range">
        <h2 id="branch-range">브랜드별 지점 요금 범위</h2>
        <p className="section-kicker">평일 일반 시간대, 성인 기준입니다. 일반관이 없는 지점은 그 지점의 기본 상영관 요금을 쓰고 상영관 이름을 함께 적었습니다.</p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">요금이 낮은 지점</th>
                <th scope="col">요금이 높은 지점</th>
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
                  <td className="num">{won(row.spread)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <h3>같은 브랜드인데 지점마다 요금이 다른 이유</h3>
          <ul>
            <li>
              <strong>기본관이 리클라이너·컴포트관인 지점</strong>: 일반 좌석 상영관을 모두 리클라이너나 컴포트관(COMFORT by MEGA)으로 바꾼 지점은 그 관이 기본관이라 시작 요금부터 다릅니다.
            </li>
            <li>
              <strong>지역과 입점 건물</strong>: 대도시 중심가나 대형 쇼핑몰 안의 지점과 중소도시 지점은 평일 기본 요금이 1,000~4,000원 차이 나기도 합니다.
            </li>
            <li>
              <strong>좌석 등급</strong>: 롯데시네마와 메가박스 일부 지점은 같은 일반관 안에서도 일반석·스페셜석·커플석·리클라이너석의 요금을 따로 받습니다.
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="time-gap">
        <h2 id="time-gap">시간대와 주말 요금</h2>
        <p className="guide-copy">
          지점별 중앙값으로 보면 평일 조조는 평일 일반 시간대보다 <strong className="num">{won(insight.morningDiscount)}</strong>{' '}
          낮고, 주말 일반 시간대는 평일보다 <strong className="num">{won(insight.weekendPremium)}</strong> 높습니다. 조조를
          CGV는 &lsquo;모닝&rsquo;, 롯데시네마·메가박스는 &lsquo;조조&rsquo;라고 부릅니다.
        </p>
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
          조조·심야 시간 기준, 청소년·경로·장애인 우대, 문화가 있는 날은 <Link className="guide-inline-link" href={guidePath(GUIDES.discounts)}>할인·우대 안내</Link>에 정리했습니다.
        </p>
      </section>

      {insight.splitSidos.length > 0 && (
        <section className="section" aria-labelledby="region-gap">
          <h2 id="region-gap">지역별 브랜드 요금 차이</h2>
          <p className="section-kicker">같은 시도 안에서 브랜드별 대표 요금이 다른 지역만 넣었습니다. 브랜드별 지점이 3곳 미만인 지역은 뺐습니다.</p>
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
                    <td>{row.cheapest.brandName} · <span className="num">{won(row.cheapest.weekdayCommon)}</span></td>
                    <td>{row.priciest.brandName} · <span className="num">{won(row.priciest.weekdayCommon)}</span></td>
                    <td className="num">{won(row.gap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {insight.levelSidos.length > 0 && (
            <p className="section-kicker" style={{ marginTop: 10 }}>
              <strong>{insight.levelSidos.join(', ')}</strong> 지역은 세 브랜드의 평일 대표 요금이 같습니다.
            </p>
          )}
        </section>
      )}

      {pricedScreens.length > 0 && (
        <section className="section" aria-labelledby="screen-gap">
          <h2 id="screen-gap">특별관 추가요금</h2>
          <p className="section-kicker">같은 지점 기본관의 평일 일반 시간대 성인 요금과 비교했습니다. 요금을 확인한 지점이 3곳 이상인 특별관만 넣었습니다.</p>
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
                    <td className="num">{screen.branchCount}곳</td>
                    <td className="num">{formatExtra(screen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="section-kicker">어느 지점에 있는지와 상영 방식은 <Link className="guide-inline-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link>에 있습니다.</p>
        </section>
      )}

      <section className="section" aria-labelledby="fare-faq">
        <h2 id="fare-faq">관람료 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>CGV·롯데시네마·메가박스는 기본 관람료가 다른가요?</dt>
            <dd>
              가장 흔한 요금은 세 브랜드 모두 일반관 2D 성인 평일 14,000원, 주말 15,000원으로 같습니다. 요금은 브랜드보다 지점의 상영관 구성(일반석인지 리클라이너·컴포트석인지)과 시간대(조조·모닝·브런치·일반)에 따라 더 크게 달라집니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>조조(모닝)로 보면 얼마나 덜 내나요?</dt>
            <dd>
              평일 일반 시간대 성인 요금과 조조 요금의 차이는 지점별 중앙값으로 {won(insight.morningDiscount)}입니다. 지점과 상영관에 따라 3,000~5,000원 사이입니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>청소년 요금은 몇 살까지인가요?</dt>
            <dd>
              보통 만 7세~만 18세(초·중·고등학생)까지이고, 평일 일반관 기준 성인 요금보다 2,000~4,000원 낮습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>같은 상영관인데 좌석마다 가격이 다른 이유는 뭔가요?</dt>
            <dd>
              롯데시네마와 메가박스 일부 상영관, CGV 일부 특별관·리클라이너관은 한 관 안에 일반석·스페셜석·커플석·모션석을 함께 두고 좌석 종류별로 요금을 다르게 받기 때문입니다.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">비교 기준</h2>
        <p className="guide-copy">CGV 일반(2D), 롯데시네마 2D 일반석, 메가박스 일반 2D를 같은 것으로 보고 비교했습니다. 일반관이 없는 지점은 리클라이너·컴포트처럼 그 지점의 기본 상영관 요금을 썼습니다. 기준은 평일 일반 시간대 성인 요금이고, 심야·브런치처럼 일부 브랜드나 지점에만 있는 시간대는 뺐습니다.</p>
        <p className="section-kicker">요금 확인일 {meta.checkedAt} · 전국 {meta.totalBranches}개 지점 중 {comparable}곳 비교</p>
      </section>
    </div>
  );
}
