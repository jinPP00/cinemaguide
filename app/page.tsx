import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import { meta, branches, branchesOfBrand, brandPath, sidoPath, sidosOfBrand, branchPath, isOperating } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { brandProfiles, fareInsight, won } from '@/lib/fares';
import { SITE } from '@/lib/site';
import { brandThemeVars } from '@/lib/colors';
import type { CSSProperties } from 'react';
import BranchQuickSearch, { type SearchableBranch } from './BranchQuickSearch';

export const metadata = withOpenGraphUrl({
  title: `${SITE.name} - CGV·롯데시네마·메가박스 전국 지점 정보`,
  description: SITE.description,
  alternates: { canonical: '/' },
});

export default function HomePage() {
  const total = meta.totalBranches;
  const specialBranches = branches.filter((b) => isOperating(b) && b.specialScreens.length > 0).length;
  const profiles = brandProfiles();
  const insight = fareInsight();

  const searchItems: SearchableBranch[] = branches
    .filter((b) => isOperating(b))
    .map((b) => ({
      id: b.id,
      name: b.name,
      brand: b.brand,
      brandName: b.brandName,
      sido: b.sido,
      sigungu: b.sigungu ?? '',
      path: branchPath(b),
      specialScreens: b.specialScreens,
    }));

  // 안내 페이지 목록. 예전엔 같은 크기 카드 5개를 3열로 늘어놓아 마지막 줄이
  // 비고, 설명도 "분석 가이드" 같은 홍보 문구였다. 무엇을 볼 수 있는지만 한 줄로 적는다.
  const guides = [
    { href: guidePath(GUIDES.fares), title: '관람료 비교', desc: '브랜드·지역·시간대별 일반관 2D 성인 요금' },
    { href: guidePath(GUIDES.screens), title: '특별관', desc: `IMAX·4DX·SCREENX·돌비 시네마가 있는 ${specialBranches}개 지점과 추가 요금` },
    { href: guidePath(GUIDES.parking), title: '주차', desc: '무료 주차 시간, 정산 방법, 백화점 영수증 합산 기준' },
    { href: guidePath(GUIDES.discounts), title: '할인·우대', desc: '조조·심야 요금, 청소년·경로·장애인 우대, 문화가 있는 날' },
    { href: guidePath(GUIDES.boxoffice), title: '영화 순위', desc: '영화진흥위원회 집계 일별 박스오피스와 관객 수' },
  ];

  return (
    <div className="wrap page">
      <div className="home-intro">
        <h1>전국 영화관 지점안내</h1>
        <p className="guide-lead">
          CGV·롯데시네마·메가박스 {total}개 지점의 주소, 가는 길, 주차 조건, 관람료를 지점별로
          모았습니다. 상영시간표와 예매는 각 영화관 공식 사이트로 연결합니다.
        </p>
        <BranchQuickSearch items={searchItems} />
      </div>

      <section className="section" aria-labelledby="brands">
        <h2 id="brands">브랜드별 지점</h2>
        <div className="card-grid cols-3" style={{ marginTop: 16 }}>
          {meta.brands.map((b) => {
            const list = branchesOfBrand(b.key);
            const sidoCount = sidosOfBrand(b.key).length;
            const specialCount = list.filter((x) => isOperating(x) && x.specialScreens.length > 0).length;
            return (
              <Link
                key={b.key}
                href={brandPath(b.segment)}
                className="card brand-card"
                style={brandThemeVars(b.key) as CSSProperties}
              >
                <div className="brand-card-name">{b.name}</div>
                <dl className="brand-card-stats">
                  <div>
                    <dt>지점</dt>
                    <dd>{b.count}</dd>
                  </div>
                  <div>
                    <dt>시도</dt>
                    <dd>{sidoCount}</dd>
                  </div>
                  <div>
                    <dt>특별관 보유</dt>
                    <dd>{specialCount}</dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="compare">
        <h2 id="compare">이용 안내</h2>
        <ul className="guide-index">
          {guides.map((g) => (
            <li key={g.href}>
              <Link href={g.href}>
                <span className="guide-index-title">{g.title}</span>
                <span className="guide-index-desc">{g.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="brand-diff">
        <h2 id="brand-diff">세 브랜드 비교</h2>
        <p className="section-kicker">일반관 2D, 성인 요금 기준입니다.</p>
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
                <th scope="row">운영 지점</th>
                {profiles.map((p) => <td key={p.brand} className="num">{p.branchCount}곳</td>)}
              </tr>
              <tr>
                <th scope="row">평일 요금</th>
                {profiles.map((p) => <td key={p.brand} className="num">{p.weekdayCommon != null ? won(p.weekdayCommon) : '-'}</td>)}
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
                {profiles.map((p) => <td key={p.brand} className="num">{p.seatGradedCount === 0 ? '없음' : `${p.seatGradedCount}곳`}</td>)}
              </tr>
              <tr>
                <th scope="row">특별관 보유</th>
                {profiles.map((p) => (
                  <td key={p.brand}>
                    <span className="num">{p.specialBranchCount}곳</span>
                    <span className="subline">{p.specialKindCount}종류</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose">
          <h3>브랜드별 차이</h3>
          <p>
            세 브랜드의 일반관 2D 성인 요금은 대부분 평일 14,000원, 주말 15,000원으로 같습니다. 차이는
            시간대 구분과 상영관 구성에서 납니다. <strong>CGV</strong>는 모닝·브런치·일반·심야로 시간대를
            나누고, IMAX·4DX·SCREENX 같은 특별관을 둔 지점이 많습니다. <strong>롯데시네마</strong>는
            백화점·쇼핑몰 안에 있는 지점이 많고, 지점 요금표에 경로·장애인 요금을 따로 적어 둡니다.{' '}
            <strong>메가박스</strong>는 컴포트관, 리클라이너, 돌비 시네마처럼 좌석이나 음향을 바꾼 상영관이
            많고, 같은 상영관 안에서도 좌석 등급별로 요금을 나누는 지점이 있습니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="by-region">
        <h2 id="by-region">지역별 지점</h2>
        <p className="section-kicker">시도를 고르면 시·군·구별 지점 목록과 지역 요금이 나옵니다.</p>
        <div className="stack" style={{ marginTop: 16 }}>
          {meta.brands.map((b) => (
            <div key={b.key} className="region-brand-box" style={brandThemeVars(b.key) as CSSProperties}>
              <div className="region-brand-title">{b.name}</div>
              <ul className="chip-list">
                {sidosOfBrand(b.key).map((sido) => (
                  <li key={sido}>
                    <Link className="chip" href={sidoPath(b.segment, sido)}>
                      {sido} <span className="chip-count">{meta.byBrandSido[b.key]?.[sido] ?? 0}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="home-faq">
        <h2 id="home-faq">자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>상영시간표와 남은 좌석은 어디서 보나요?</dt>
            <dd>
              이 사이트에는 상영시간표가 없습니다. 시간표는 하루에도 여러 번 바뀌기 때문에, 지점 페이지의
              &lsquo;상영시간표 확인&rsquo; 버튼으로 해당 영화관의 공식 페이지에 연결합니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>조조 요금과 주말 요금은 평일과 얼마나 다른가요?</dt>
            <dd>
              3사 지점 요금표의 중앙값으로 보면, 평일 조조(모닝) 성인 요금은 평일 일반 시간대보다{' '}
              {won(insight.morningDiscount)} 낮고 주말 일반 시간대는 평일보다 {won(insight.weekendPremium)}{' '}
              높습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>주차 무료 시간은 지점마다 같나요?</dt>
            <dd>
              다릅니다. 3시간 무료인 지점이 가장 많지만, 건물에 따라 3시간 30분~4시간 무료, 시간 제한 없이
              무료, 3시간에 1,500~3,500원을 받는 곳도 있고 전용 주차장이 없는 지점도 있습니다. 갈 지점
              페이지의 주차 항목을 확인하세요.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">
          지점 정보는 각 브랜드 공식 사이트를 기준으로 정리했습니다. 바뀌었거나 틀린 정보는{' '}
          <Link href="/contact/">정정 요청</Link>으로 알려 주세요.
        </div>
      </section>
    </div>
  );
}
