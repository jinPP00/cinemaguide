import Link from 'next/link';
import { meta, branches, branchesOfBrand, brandPath, sidosOfBrand } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { brandProfiles, won } from '@/lib/fares';
import { SITE } from '@/lib/site';
import { BRAND_ICON_COLOR, BRAND_WORDMARK, brandThemeVars } from '@/lib/colors';
import type { CSSProperties } from 'react';
import { IconClapper } from './icons';

export const metadata = {
  title: `${SITE.name} - CGV·롯데시네마·메가박스 전국 지점 정보`,
  description: SITE.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const total = meta.totalBranches;
  const specialBranches = branches.filter((b) => b.specialScreens.length > 0).length;
  const profiles = brandProfiles();
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
        CGV·롯데시네마·메가박스 <strong>{total}개 지점</strong>의 주소, 가는 길, 주차 조건, 관람료를 같은 형식으로 정리했습니다. 지점을 고르면 공식 상영시간표로 바로 이동할 수 있습니다.
      </p>

      <section className="section" aria-labelledby="brands">
        <h2 id="brands">브랜드 선택</h2>
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
        <h2 id="compare">영화관 정보 한눈에 보기</h2>
        <p className="section-kicker">3사 데이터를 같은 기준으로 정리한 페이지입니다.</p>
        <div className="card-grid cols-3" style={{ marginTop: 16 }}>
          <Link href={guidePath(GUIDES.fares)} className="card">
            <div className="card-title">관람료 비교</div>
            <div className="card-sub">일반관 2D 성인 요금을 평일·주말·지역·시간대 기준으로 비교합니다.</div>
            <div className="card-more">관람료 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.screens)} className="card">
            <div className="card-title">특별관 안내</div>
            <div className="card-sub">IMAX·4DX·SCREENX·돌비 계열 등 {specialBranches}개 지점의 특별관 종류와 운영 지점을 확인합니다.</div>
            <div className="card-more">특별관 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.boxoffice)} className="card">
            <div className="card-title">영화순위</div>
            <div className="card-sub">영화진흥위원회 집계 기준 박스오피스 순위와 감독·출연·러닝타임을 확인합니다.</div>
            <div className="card-more">영화순위 보기 →</div>
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="brand-diff">
        <h2 id="brand-diff">세 브랜드 요금표 비교</h2>
        <p className="section-kicker">일반관 2D 성인 요금과 시간대 구분, 좌석 등급, 특별관 운영 현황입니다.</p>
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
      </section>

      <section className="section" aria-labelledby="by-region">
        <h2 id="by-region">지역으로 찾기</h2>
        <p className="section-kicker">브랜드를 선택한 뒤 원하는 시도 지점 목록으로 이동할 수 있습니다.</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {meta.brands.map((b) => (
            <div key={b.key}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{b.name}</div>
              <ul className="chip-list">
                {sidosOfBrand(b.key).map((sido) => (
                  <li key={sido}>
                    <Link className="chip" href={`${brandPath(b.segment)}${encodeURIComponent(sido)}/`}>
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
              <p className="how-desc">CGV·롯데시네마·메가박스 중 선택해 지역별 지점을 찾습니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">2</span>
            <div>
              <div className="how-title">지점 정보 확인</div>
              <p className="how-desc">주소, 교통, 주차, 관람료와 특별관 정보를 확인합니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">3</span>
            <div>
              <div className="how-title">공식 상영시간표 이동</div>
              <p className="how-desc">지점 페이지의 버튼으로 해당 영화관 공식 시간표를 엽니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">4</span>
            <div>
              <div className="how-title">최종 조건 확인</div>
              <p className="how-desc">관람료와 주차 조건은 방문 전 공식 페이지에서 다시 확인합니다.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="section">
        <div className="note">지점 정보는 각 브랜드 공식 사이트를 기준으로 정리했습니다. 변경되거나 잘못된 정보는 <Link href="/contact/">정정 요청</Link>으로 알려주세요.</div>
      </section>
    </div>
  );
}
