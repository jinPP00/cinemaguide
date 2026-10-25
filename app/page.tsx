import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import { meta, branches, branchesOfBrand, brandPath, sidoPath, sidosOfBrand } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { brandProfiles, fareInsight, won } from '@/lib/fares';
import { SITE } from '@/lib/site';
import { BRAND_ICON_COLOR, BRAND_WORDMARK, brandThemeVars } from '@/lib/colors';
import type { CSSProperties } from 'react';
import { IconClapper } from './icons';

export const metadata = withOpenGraphUrl({
  title: `${SITE.name} - CGV·롯데시네마·메가박스 전국 지점 정보`,
  description: SITE.description,
  alternates: { canonical: '/' },
});

export default function HomePage() {
  const total = meta.totalBranches;
  const specialBranches = branches.filter((b) => b.specialScreens.length > 0).length;
  const profiles = brandProfiles();
  const insight = fareInsight();
  const slotLeader = [...profiles].sort((a, b) => b.commonSlots.length - a.commonSlots.length)[0];
  const seatLeader = [...profiles].sort(
    (a, b) => b.seatGradedCount / b.branchCount - a.seatGradedCount / a.branchCount,
  )[0];
  const screenLeader = [...profiles].sort(
    (a, b) => b.specialBranchCount / b.branchCount - a.specialBranchCount / a.branchCount,
  )[0];

  return (
    <div className="wrap page">
      <h1>전국 영화관 지점안내</h1>
      <p className="guide-lead">
        CGV·롯데시네마·메가박스 <strong>전국 {total}개 지점</strong>의 주소, 대중교통 가는 길, 주차 무료 시간·초과 요금·정산 방법, 상영관별·시간대별 관람료를 같은 기준으로 정리했습니다. 방문할 지점을 선택해 관람 조건과 주변 대안 극장을 비교하고 공식 상영시간표로 바로 이동할 수 있습니다.
      </p>

      <section className="section" aria-labelledby="brands">
        <h2 id="brands">브랜드별 전국 지점 안내</h2>
        <p className="section-kicker">원하는 멀티플렉스 브랜드를 선택하면 전국 17개 시도별 지점 목록과 운영 현황을 확인할 수 있습니다.</p>
        <div className="card-grid cols-3" style={{ marginTop: 16 }}>
          {meta.brands.map((b) => {
            const list = branchesOfBrand(b.key);
            const sidoCount = sidosOfBrand(b.key).length;
            const specialCount = list.filter((x) => x.specialScreens.length > 0).length;
            const iconColor = BRAND_ICON_COLOR[b.key];
            const themeVars = brandThemeVars(b.key) as CSSProperties;
            return (
              <Link
                key={b.key}
                href={brandPath(b.segment)}
                className="card brand-card brand-card--stripe"
                style={themeVars}
              >
                <div className="brand-card-icon" style={{ color: iconColor.fg }}>
                  <IconClapper />
                </div>
                <div className="brand-wordmark" style={{ color: iconColor.fg }}>
                  {BRAND_WORDMARK[b.key]}
                </div>
                <div className="card-sub">전국 {b.count}개 지점 · {sidoCount}개 시도</div>
                <div className="badges">
                  <span className="badge badge-brand">특별관 {specialCount}곳</span>
                </div>
                <div className="card-more">지점 보기 →</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="compare">
        <h2 id="compare">영화관 핵심 이용 가이드</h2>
        <p className="section-kicker">3사 공식 데이터를 같은 기준으로 교차 비교해 정리한 분석 가이드입니다.</p>
        <div className="card-grid cols-3" style={{ marginTop: 16 }}>
          <Link href={guidePath(GUIDES.fares)} className="card">
            <div className="card-title">관람료 비교</div>
            <div className="card-sub">일반관 2D 성인 요금을 평일·주말·지역·시간대 기준으로 비교하고 지점별 요금 편차 원인을 살핍니다.</div>
            <div className="card-more">관람료 비교 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.screens)} className="card">
            <div className="card-title">특별관 안내</div>
            <div className="card-sub">IMAX·4DX·SCREENX·돌비 시네마·리클라이너 등 {specialBranches}개 지점의 특별관 종류와 추가요금을 확인합니다.</div>
            <div className="card-more">특별관 안내 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.parking)} className="card">
            <div className="card-title">주차 요금·정산 가이드</div>
            <div className="card-sub">영화 관람 시 무료 주차 시간, 사전 정산 방식 4가지, 백화점·쇼핑몰 입점 지점 합산 규칙을 정리했습니다.</div>
            <div className="card-more">주차 가이드 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.discounts)} className="card">
            <div className="card-title">할인·우대·예매 가이드</div>
            <div className="card-sub">조조(모닝)·심야 요금 차액, 청소년·경로·장애인 우대 기준, 문화가 있는 날과 통신사 할인 활용법을 안내합니다.</div>
            <div className="card-more">할인 가이드 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.boxoffice)} className="card">
            <div className="card-title">영화순위 (박스오피스)</div>
            <div className="card-sub">영화진흥위원회(KOBIS) 통합전산망 기준 박스오피스 순위와 일별·누적 관객 수, 러닝타임을 확인합니다.</div>
            <div className="card-more">영화순위 보기 →</div>
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="brand-diff">
        <h2 id="brand-diff">세 브랜드 요금표·운영 구조 비교</h2>
        <p className="section-kicker">일반관 2D 성인 기준 요금과 시간대 구분, 좌석 등급제, 특별관 운영 현황을 한눈에 비교할 수 있습니다.</p>
        <div className="data-table-shell">
          <table className="data-table data-table--brand-compare">
            <thead>
              <tr>
                <th scope="col">구분</th>
                {profiles.map((p) => (
                  <th scope="col" key={p.brand}>{p.brandName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">전국 지점</th>
                {profiles.map((p) => <td key={p.brand}>{p.branchCount}곳</td>)}
              </tr>
              <tr>
                <th scope="row">평일 기준 요금</th>
                {profiles.map((p) => <td key={p.brand}>{p.weekdayCommon != null ? won(p.weekdayCommon) : '-'}</td>)}
              </tr>
              <tr>
                <th scope="row">요금 시간대</th>
                {profiles.map((p) => (
                  <td key={p.brand}>
                    {p.commonSlots.length}구간
                    <span className="subline">{p.commonSlots.join(' · ')}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">좌석 등급별 요금</th>
                {profiles.map((p) => <td key={p.brand}>{p.seatGradedCount === 0 ? '없음' : `${p.seatGradedCount}곳`}</td>)}
              </tr>
              <tr>
                <th scope="row">특별관 운영</th>
                {profiles.map((p) => (
                  <td key={p.brand}>
                    {p.specialBranchCount}곳
                    <span className="subline">{p.specialKindCount}종류</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="fact-grid cols-3 home-compare-facts">
          <div className="fact-card">
            <span className="fact-label">시간대 구분이 가장 많은 브랜드</span>
            <span className="fact-value">{slotLeader.brandName} · {slotLeader.commonSlots.length}구간</span>
            <span className="fact-meta">{slotLeader.commonSlots.join(' · ')}</span>
          </div>
          <div className="fact-card">
            <span className="fact-label">좌석 등급별 요금 표기</span>
            <span className="fact-value">{seatLeader.brandName} · {seatLeader.seatGradedCount}곳</span>
            <span className="fact-meta">전체 {seatLeader.branchCount}개 지점 기준</span>
          </div>
          <div className="fact-card">
            <span className="fact-label">특별관 운영 지점 비중</span>
            <span className="fact-value">{screenLeader.brandName} · {screenLeader.specialBranchCount}/{screenLeader.branchCount}곳</span>
            <span className="fact-meta">확인된 특별관 {screenLeader.specialKindCount}종류</span>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 18 }}>
          <h3>3사 영화관 선택 시 알아두면 좋은 차이점</h3>
          <p>
            세 브랜드 모두 일반관 2D 성인 대표 요금은 평일 14,000원·주말 15,000원으로 동일하지만 실제 체감 요금과 관람 환경은 지점별 운영 방식에서 갈립니다. <strong>CGV</strong>는 모닝·브런치·일반·심야 등 상영 시간대를 세분화하고 아이맥스(IMAX)·4DX·SCREENX 등 기술 특화 특별관을 폭넓게 운영하는 것이 특징입니다. <strong>롯데시네마</strong>는 백화점·아울렛·롯데몰 등 복합쇼핑몰 입점 비중이 높고 지점별 요금표에 경로·장애인 우대 요금을 상세히 표기하며, <strong>메가박스</strong>는 컴포트관(COMFORT by MEGA)과 리클라이너석, 돌비 시네마·돌비 애트모스 등 음향·좌석 특화 상영관을 중심으로 좌석 등급별 요금을 세분화해 운영합니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="by-region">
        <h2 id="by-region">지역으로 찾기</h2>
        <p className="section-kicker">브랜드와 시도를 선택하면 해당 지역의 시·군·구별 지점 목록과 지역 대표 관람료·특별관 현황을 확인할 수 있습니다.</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {meta.brands.map((b) => (
            <div key={b.key}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{b.name}</div>
              <ul className="chip-list">
                {sidosOfBrand(b.key).map((sido) => (
                  <li key={sido}>
                    <Link className="chip" href={sidoPath(b.segment, sido)}>
                      {sido} <span style={{ opacity: 0.7 }}>{meta.byBrandSido[b.key]?.[sido] ?? 0}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="about-site">
        <h2 id="about-site">이 사이트를 이용하는 방법</h2>
        <ol className="how-steps">
          <li>
            <span className="how-num">1</span>
            <div>
              <div className="how-title">브랜드·지역 선택</div>
              <p className="how-desc">CGV·롯데시네마·메가박스 중 원하는 브랜드와 시도 지역을 선택해 가까운 지점을 찾습니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">2</span>
            <div>
              <div className="how-title">교통·주차·요금표 확인</div>
              <p className="how-desc">지하철 출구와 버스 노선, 무료 주차 시간과 정산 방법, 상영관·시간대별 관람료를 한 화면에서 비교합니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">3</span>
            <div>
              <div className="how-title">주변 다른 영화관과 교차 비교</div>
              <p className="how-desc">방문하려는 지점에 원하는 특별관이나 시간대가 없다면 반경 3km 내 다른 브랜드 영화관을 함께 확인합니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">4</span>
            <div>
              <div className="how-title">공식 상영시간표 이동 및 예매</div>
              <p className="how-desc">지점 페이지의 상영시간표 버튼으로 해당 극장 공식 페이지로 바로 이동해 실시간 잔여석과 시간표를 확인합니다.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="section" aria-labelledby="home-faq">
        <h2 id="home-faq">자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>실시간 상영시간표와 잔여 좌석은 어디에서 확인하나요?</dt>
            <dd>
              상영시간표는 하루에도 여러 차례 변경되므로 오안내를 막기 위해 각 지점 페이지에 마련된 &lsquo;상영시간표 확인&rsquo; 버튼을 통해 해당 영화관의 공식 예매 페이지로 직접 연결해 드립니다. 방문 전 주소·대중교통·주차 무료 시간·관람료를 먼저 비교한 뒤 공식 시간표로 이동하실 수 있습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>조조(모닝) 할인과 주말 관람료는 평일과 얼마나 차이 나나요?</dt>
            <dd>
              전국 3사 요금표 집계 기준 평일 조조(모닝) 성인 요금은 평일 일반 시간대보다 중앙값 기준 {won(insight.morningDiscount)} 낮고, 주말 일반 시간대는 평일보다 {won(insight.weekendPremium)} 높게 책정되어 있습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>영화관 주차 무료 시간은 모든 지점이 3시간으로 같나요?</dt>
            <dd>
              3시간 무료인 지점이 가장 많지만, 입점 건물에 따라 3시간 30분~4시간 무료, 관람 시 시간 제한 없는 무료, 혹은 기본 유료(3시간 1,500원~3,500원) 및 전용 주차장 미운영 등 조건이 모두 다릅니다. 반드시 방문할 지점 페이지의 주차 안내 섹션을 확인하세요.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">지점 정보는 각 브랜드 공식 사이트를 기준으로 정리했습니다. 변경되거나 잘못된 정보는 <Link href="/contact/">정정 요청</Link>으로 알려주세요.</div>
      </section>
    </div>
  );
}
