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

  // 비교표 아래 문단은 "어느 브랜드가 무엇을 쪼개는가"를 설명한다. 브랜드 이름을
  // 문장에 박아두면 데이터가 바뀔 때 틀린 말이 되므로 매번 데이터에서 찾는다.
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

      <p className="lead" style={{ marginTop: 12 }}>
        CGV·롯데시네마·메가박스 <strong>{total}개 지점</strong>의 위치와 가는 길, 주차 조건,
        관람료를 한 곳에서 정리했습니다. 브랜드를 선택해 원하는 지역의 지점을 찾아보세요.
      </p>

      <p style={{ marginTop: 16, color: 'var(--ink-soft)' }}>
        영화관 지점마다 상영관 종류·주차 조건·요금 체계가 제각각이라, 상영시간표만으로는
        실제로 가서 부딪히는 문제(주차장이 있는지, 발렛인지, 몇 호선 몇 번 출구가 가까운지)를
        해결하기 어렵습니다. 이 사이트는 각 브랜드 공식 페이지에 흩어져 있는 그 정보를
        지점 단위로 모아 같은 형식으로 정리해, 예매 전에 한 번에 확인할 수 있도록 만들었습니다.
      </p>

      {/* 브랜드 카드 3개 (기획서 8.1) */}
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
                <div className="card-sub">
                  전국 {b.count}개 지점 · {sidoCount}개 시도
                </div>
                <div className="badges">
                  <span className="badge badge-brand">특별관 {specialCount}곳</span>
                </div>
                <div className="card-more">지점 보기 →</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3사를 가로지르는 페이지 — 브랜드를 이미 정한 사람은 공식 사이트로 가면 되고,
          "어디가 싼지"·"어느 관이 뭐가 다른지"를 정하려는 사람에게 이 사이트가 필요하다.
          숫자는 전부 data/*.json에서 계산해 넣는다(문구에 직접 박지 않는다). */}
      <section className="section" aria-labelledby="compare">
        <h2 id="compare">3사를 한자리에 놓고 보기</h2>
        <p className="card-sub" style={{ marginTop: 6 }}>
          브랜드마다 요금표와 상영관 이름이 달라서 공식 사이트를 오가며 비교하기 어렵습니다.
          전국 {total}개 지점 데이터를 같은 기준으로 맞춰 정리했습니다.
        </p>
        <div className="card-grid cols-3" style={{ marginTop: 16 }}>
          <Link href={guidePath(GUIDES.fares)} className="card">
            <div className="card-title">관람료 비교</div>
            <div className="card-sub">
              브랜드를 바꿔도 요금은 거의 같습니다. 실제로 금액을 좌우하는 것이 무엇인지
              지점별 요금표로 확인합니다.
            </div>
            <div className="card-more">비교 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.screens)} className="card">
            <div className="card-title">특별관 안내</div>
            <div className="card-sub">
              아이맥스·4DX·돌비시네마 등 {specialBranches}곳의 특별관을 종류별로 묶고, 기본관보다
              얼마나 비싼지 계산했습니다.
            </div>
            <div className="card-more">종류별로 보기 →</div>
          </Link>
          <Link href={guidePath(GUIDES.boxoffice)} className="card">
            <div className="card-title">박스오피스 순위</div>
            <div className="card-sub">
              영화진흥위원회 집계 기준 순위와 감독·출연·러닝타임입니다. 매주 월요일 갱신합니다.
            </div>
            <div className="card-more">순위 보기 →</div>
          </Link>
        </div>
      </section>

      {/* 브랜드 카드는 "몇 곳인가"만 말해준다. 정작 고를 때 필요한 건 "요금을
          어떤 축으로 쪼개는가"인데, 이건 세 브랜드 요금표를 나란히 놓아야만
          보인다. 표의 숫자는 전부 data/prices.json에서 계산한다. */}
      <section className="section" aria-labelledby="brand-diff">
        <h2 id="brand-diff">세 브랜드는 무엇이 다른가</h2>
        <p className="card-sub" style={{ marginTop: 6 }}>
          기준 요금은 세 곳이 거의 같습니다. 차이는 그 요금을 무엇으로 나누느냐에서 납니다.
        </p>
        <div className="table-scroll" style={{ marginTop: 16 }}>
          <table className="fare-table">
            <thead>
              <tr>
                <th scope="col">구분</th>
                {profiles.map((p) => (
                  <th scope="col" key={p.brand}>
                    {p.brandName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">전국 지점</th>
                {profiles.map((p) => (
                  <td key={p.brand}>{p.branchCount}곳</td>
                ))}
              </tr>
              <tr>
                <th scope="row">평일 기준 요금</th>
                {profiles.map((p) => (
                  <td key={p.brand}>{p.weekdayCommon != null ? won(p.weekdayCommon) : '-'}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">요금 시간대 구분</th>
                {profiles.map((p) => (
                  <td key={p.brand}>
                    {p.commonSlots.length}구간
                    <span className="fare-note">{p.commonSlots.join('·')}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">좌석 등급별 요금</th>
                {profiles.map((p) => (
                  <td key={p.brand}>
                    {p.seatGradedCount === 0 ? '없음' : `${p.seatGradedCount}곳`}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">특별관 운영</th>
                {profiles.map((p) => (
                  <td key={p.brand}>
                    {p.specialBranchCount}곳
                    <span className="fare-note">{p.specialKindCount}종류</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            {slotLeader.brandName}는 요금을 {slotLeader.commonSlots.length}개 시간대로 나눠서, 상영
            시간을 조금만 옮겨도 금액이 달라집니다. 반대로 {seatLeader.brandName}는 시간대가{' '}
            {seatLeader.commonSlots.length}구간뿐이지만 같은 상영관 안에서 좌석 등급마다 값을 따로
            받습니다
            {seatLeader.seatGradedCount === seatLeader.branchCount
              ? ' — 전 지점이 그렇습니다.'
              : ` — ${seatLeader.branchCount}곳 중 ${seatLeader.seatGradedCount}곳이 그렇습니다.`}
          </p>
          <p>
            특별관 비중도 다릅니다. {screenLeader.brandName}는 전국 {screenLeader.branchCount}곳 중{' '}
            {screenLeader.specialBranchCount}곳이 특별관을 함께 운영합니다. 상영관 종류에 따라
            요금이 얼마나 벌어지는지는{' '}
            <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>에 정리했습니다.
          </p>
        </div>
      </section>

      {/* 지역으로 바로 찾기 — 브랜드를 정하지 않은 사용자의 진입 동선 */}
      <section className="section" aria-labelledby="by-region">
        <h2 id="by-region">지역으로 찾기</h2>
        <p className="card-sub" style={{ marginTop: 6 }}>
          브랜드별 해당 지역 지점 목록으로 이동합니다.
        </p>
        <div className="stack" style={{ marginTop: 16 }}>
          {meta.brands.map((b) => (
            <div key={b.key}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{b.name}</div>
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

      {/* 사이트 안내 — 4단계 요약. 예전엔 긴 문단 4개였는데 스캔하기 어려워
          짧은 단계형으로 압축했다 (가이드 3.1의 '분량보다 우선하는 기준' 참고 —
          검색 의도를 해결하면 짧아도 된다). */}
      <section className="section" aria-labelledby="about-site">
        <h2 id="about-site">이 사이트를 이용하는 방법</h2>
        <ol className="how-steps">
          <li>
            <span className="how-num">1</span>
            <div>
              <div className="how-title">브랜드를 고르세요</div>
              <p className="how-desc">CGV·롯데시네마·메가박스 중 선택하면 지역별 지점 목록이 나옵니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">2</span>
            <div>
              <div className="how-title">지점 정보를 한눈에</div>
              <p className="how-desc">주소, 교통, 주차, 관람료를 한 화면에서 확인합니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">3</span>
            <div>
              <div className="how-title">상영시간표는 공식으로</div>
              <p className="how-desc">실시간 정보라 직접 제공하지 않고 버튼으로 공식 페이지에 연결합니다.</p>
            </div>
          </li>
          <li>
            <span className="how-num">4</span>
            <div>
              <div className="how-title">요금은 시간대별로 다름</div>
              <p className="how-desc">브랜드마다 시간대 구분이 달라 방문 전 확인하는 게 좋습니다.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="section">
        <div className="note">
          지점 정보는 각 브랜드 공식 사이트에서 수집해 정리했습니다. 요금과 주차 정책은 수시로
          변경될 수 있으므로 방문 전 공식 채널에서 최종 정보를 확인하시기 바랍니다. 잘못된
          정보를 발견하셨다면 <Link href="/contact/">정정 요청</Link>으로 알려주세요.
        </div>
      </section>
    </div>
  );
}
