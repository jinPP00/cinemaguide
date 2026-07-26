import Link from 'next/link';
import { meta, branchesOfBrand, brandPath, sidosOfBrand } from '@/lib/data';
import { SITE } from '@/lib/site';
import { BRAND_ICON_COLOR, brandThemeVars, sidoColor } from '@/lib/colors';
import type { CSSProperties } from 'react';

export const metadata = {
  title: `${SITE.name} - CGV·롯데시네마·메가박스 전국 지점 정보`,
  description: SITE.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const total = meta.totalBranches;

  return (
    <div className="wrap page">
      <h1>전국 영화관 지점안내</h1>

      <p className="lead" style={{ marginTop: 12 }}>
        CGV·롯데시네마·메가박스 <strong>{total}개 지점</strong>의 위치와 가는 길, 주차 조건,
        관람료를 한 곳에서 정리했습니다. 브랜드를 선택해 원하는 지역의 지점을 찾아보세요.
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
                className="card brand-card"
                style={themeVars}
              >
                <div
                  className="brand-icon brand-icon-lg"
                  style={{ background: iconColor.bg, color: iconColor.fg }}
                  aria-hidden="true"
                >
                  {b.name[0]}
                </div>
                <div className="card-title">{b.name}</div>
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
                {sidosOfBrand(b.key).map((sido) => {
                  const c = sidoColor(sido);
                  return (
                    <li key={sido}>
                      <Link
                        className="chip chip-sido"
                        style={{ background: c.bg, color: c.fg, borderColor: 'transparent' }}
                        href={`${brandPath(b.segment)}${encodeURIComponent(sido)}/`}
                      >
                        {sido} <span style={{ opacity: 0.7 }}>{meta.byBrandSido[b.key]?.[sido] ?? 0}</span>
                      </Link>
                    </li>
                  );
                })}
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
