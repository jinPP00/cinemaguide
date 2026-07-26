import Link from 'next/link';
import { meta, branchesOfBrand, brandPath, sidosOfBrand } from '@/lib/data';
import { SITE } from '@/lib/site';

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
            return (
              <Link
                key={b.key}
                href={brandPath(b.segment)}
                className={`card brand-card brand-${b.key}`}
              >
                <div className="card-title">{b.name}</div>
                <div className="card-sub">
                  전국 {b.count}개 지점 · {sidoCount}개 시도
                </div>
                <div className="badges">
                  <span className="badge">특별관 {specialCount}곳</span>
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
                {sidosOfBrand(b.key).map((sido) => (
                  <li key={sido}>
                    <Link
                      className="chip"
                      href={`${brandPath(b.segment)}${encodeURIComponent(sido)}/`}
                    >
                      {sido}{' '}
                      <span style={{ color: 'var(--ink-faint)' }}>
                        {meta.byBrandSido[b.key]?.[sido] ?? 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 사이트 안내 본문 — 얇은 페이지가 되지 않도록 문장형 설명 (가이드 3.1) */}
      <section className="section" aria-labelledby="about-site">
        <h2 id="about-site">이 사이트를 이용하는 방법</h2>
        <div style={{ marginTop: 12, maxWidth: '68ch' }}>
          <p>
            영화를 보러 가기 전에 확인하게 되는 정보는 대개 비슷합니다. 상영시간표는 어디서
            보는지, 지하철역에서 얼마나 걸리는지, 차를 가져가도 되는지, 주차비는 얼마나 나오는지
            같은 것들입니다. 그런데 이 정보는 브랜드별 공식 사이트에 흩어져 있고, 지점 상세
            정보는 여러 번 눌러 들어가야 나오는 경우가 많습니다.
          </p>
          <p>
            이 사이트는 그 정보를 지점 단위로 모아 정리합니다. 브랜드를 고르면 시도별 지점 목록이
            나오고, 지점을 선택하면 해당 지점의 주소와 교통편, 주차 조건, 관람료를 한 화면에서
            볼 수 있습니다. 상영시간표는 실시간으로 바뀌는 정보이므로 직접 제공하지 않고, 각 지점
            페이지 상단에서 공식 예매 페이지로 바로 이동할 수 있게 해두었습니다.
          </p>
          <p>
            요금은 브랜드마다 기준이 다릅니다. CGV는 하루를 모닝·브런치·일반·심야로 나누고,
            롯데시네마와 메가박스는 조조와 일반으로 구분합니다. 세 브랜드 모두 평일과 주말 요금이
            따로 있으며, 특별관은 일반관보다 높은 요금이 적용됩니다. 같은 영화를 보더라도 시간대와
            상영관 선택에 따라 실제 지출은 달라집니다.
          </p>
          <p>
            주차 조건은 지점별 차이가 가장 큰 항목입니다. 영화 관람만으로 몇 시간이 무료인지,
            초과하면 얼마가 붙는지, 정산은 어디서 하는지가 지점마다 다르고, 쇼핑몰에 입점한
            지점은 구매 금액에 따라 무료 시간이 늘어나기도 합니다. 방문 전 해당 지점의 주차
            안내를 확인하면 예상하지 못한 비용을 줄일 수 있습니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="note">
          지점 정보는 각 브랜드 공식 사이트에서 수집해 정리했으며, 마지막 확인일은{' '}
          {meta.checkedAt}입니다. 요금과 주차 정책은 수시로 변경될 수 있으므로 방문 전 공식
          채널에서 최종 정보를 확인하시기 바랍니다. 잘못된 정보를 발견하셨다면{' '}
          <Link href="/contact/">정정 요청</Link>으로 알려주세요.
        </div>
      </section>
    </div>
  );
}
