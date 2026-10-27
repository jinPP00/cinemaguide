import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import { meta, branches, branchesOfBrand, brandPath, sidoPath, sidosOfBrand, branchPath, isOperating } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { brandProfiles, fareInsight, won } from '@/lib/fares';
import { SITE } from '@/lib/site';
import { brandThemeVars } from '@/lib/colors';
import type { CSSProperties, ReactNode } from 'react';
import { IconChart, IconClapper, IconCoin, IconCar, IconPercent, IconPin, IconSparkle, IconTicket } from './icons';
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
  const weekdayFare = profiles.find((p) => p.weekdayCommon != null)?.weekdayCommon ?? null;
  const sidoCount = new Set(branches.map((b) => b.sido)).size;

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

  const stats: { icon: ReactNode; label: string; value: string }[] = [
    { icon: <IconClapper />, label: '전국 지점', value: `${total}곳` },
    { icon: <IconSparkle />, label: '특별관 있는 곳', value: `${specialBranches}곳` },
    { icon: <IconTicket />, label: '평일 대표 요금', value: weekdayFare != null ? won(weekdayFare) : '-' },
    { icon: <IconPin />, label: '시도', value: `${sidoCount}곳` },
  ];

  // 안내 페이지: 무엇을 볼 수 있는지 두 줄로, 카드마다 다른 연한 바탕색
  const guides = [
    { href: guidePath(GUIDES.fares), label: '관람료 비교', title: ['브랜드·시간대별', '요금을 비교해요'], tone: 'blue', icon: <IconCoin /> },
    { href: guidePath(GUIDES.screens), label: '특별관', title: ['IMAX·4DX 있는', `${specialBranches}곳을 모았어요`], tone: 'purple', icon: <IconSparkle /> },
    { href: guidePath(GUIDES.parking), label: '주차', title: ['무료 시간과', '정산 방법을 알려 드려요'], tone: 'green', icon: <IconCar /> },
    { href: guidePath(GUIDES.discounts), label: '할인·우대', title: ['조조·우대 요금을', '정리했어요'], tone: 'pink', icon: <IconPercent /> },
    { href: guidePath(GUIDES.boxoffice), label: '영화 순위', title: ['박스오피스 순위를', '볼 수 있어요'], tone: 'orange', icon: <IconChart /> },
  ];

  return (
    <div className="wrap page">
      <div className="home-intro">
        <span className="home-badge" aria-hidden="true">
          <IconClapper />
        </span>
        <h1>
          <span className="accent">주차·요금·가는 길까지</span>
          전국 영화관 지점안내
        </h1>
        <p className="guide-lead">
          CGV·롯데시네마·메가박스 {total}개 지점 정보를 한곳에 모았어요. 상영시간표와 예매는 각 영화관 공식
          사이트로 연결해 드려요.
        </p>
        <dl className="stat-tiles">
          {stats.map((s) => (
            <div className="stat-tile" key={s.label}>
              <span className="stat-icon" aria-hidden="true">
                {s.icon}
              </span>
              <div>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <BranchQuickSearch items={searchItems} />
      </div>

      <section className="section" aria-labelledby="brands">
        <h2 id="brands">어느 영화관에 가세요?</h2>
        <div className="card-grid cols-3" style={{ marginTop: 18 }}>
          {meta.brands.map((b) => {
            const list = branchesOfBrand(b.key);
            const sidos = sidosOfBrand(b.key).length;
            const specialCount = list.filter((x) => isOperating(x) && x.specialScreens.length > 0).length;
            return (
              <Link
                key={b.key}
                href={brandPath(b.segment)}
                className="card brand-card"
                style={brandThemeVars(b.key) as CSSProperties}
              >
                <div className="brand-card-tile">
                  <span className="brand-card-badge">특별관 {specialCount}곳</span>
                  <span className="brand-card-mark">{b.name}</span>
                </div>
                <div className="brand-card-name">{b.name} · 전국 {sidos}개 시도</div>
                <div className="brand-card-figure">
                  지점 <em>{b.count}곳</em>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="compare">
        <h2 id="compare" className="home-heading">
          영화관 가기 전에
          <br />
          이것만 보면 돼요
        </h2>
        <ul className="feature-cards">
          {guides.map((g) => (
            <li key={g.href}>
              <Link href={g.href} className={`feature-card feature-card--${g.tone}`}>
                <span className="feature-label">{g.label}</span>
                <span className="feature-title">
                  {g.title[0]}
                  <br />
                  {g.title[1]}
                </span>
                <span className="feature-icon" aria-hidden="true">
                  {g.icon}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="brand-diff">
        <h2 id="brand-diff">세 브랜드, 뭐가 다를까요?</h2>
        <p className="section-kicker">일반관 2D, 성인 요금 기준이에요.</p>
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
            세 브랜드의 일반관 2D 성인 요금은 대부분 평일 14,000원, 주말 15,000원으로 같아요. 차이는 시간대
            구분과 상영관 구성에서 나요. <strong>CGV</strong>는 모닝·브런치·일반·심야로 시간대를 나누고,
            IMAX·4DX·SCREENX 같은 특별관을 둔 지점이 많아요. <strong>롯데시네마</strong>는 백화점·쇼핑몰 안에
            있는 지점이 많고, 지점 요금표에 경로·장애인 요금을 따로 적어 둬요. <strong>메가박스</strong>는
            컴포트관, 리클라이너, 돌비 시네마처럼 좌석이나 음향을 바꾼 상영관이 많고, 같은 상영관 안에서도 좌석
            등급별로 요금을 나누는 지점이 있어요.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="by-region">
        <h2 id="by-region">지역으로 찾아보세요</h2>
        <p className="section-kicker">시도를 고르면 시·군·구별 지점과 지역 요금이 나와요.</p>
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
        <dl className="faq-list" style={{ marginTop: 18 }}>
          <div className="faq-item">
            <dt>상영시간표와 남은 좌석은 어디서 보나요?</dt>
            <dd>
              이 사이트에는 상영시간표가 없어요. 시간표는 하루에도 여러 번 바뀌어서, 지점 페이지의
              &lsquo;상영시간표 확인&rsquo; 버튼으로 해당 영화관의 공식 페이지에 연결해 드려요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>조조 요금과 주말 요금은 평일과 얼마나 다른가요?</dt>
            <dd>
              3사 지점 요금표의 중앙값으로 보면, 평일 조조(모닝) 성인 요금은 평일 일반 시간대보다{' '}
              {won(insight.morningDiscount)} 낮고 주말 일반 시간대는 평일보다 {won(insight.weekendPremium)} 높아요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>주차 무료 시간은 지점마다 같나요?</dt>
            <dd>
              달라요. 3시간 무료인 지점이 가장 많지만, 건물에 따라 3시간 30분~4시간 무료, 시간 제한 없이 무료,
              3시간에 1,500~3,500원을 받는 곳도 있고 전용 주차장이 없는 지점도 있어요. 갈 지점 페이지의 주차
              항목을 확인하세요.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">
          지점 정보는 각 브랜드 공식 사이트를 기준으로 정리했어요. 바뀌었거나 틀린 정보는{' '}
          <Link href="/contact/">정정 요청</Link>으로 알려 주세요.
        </div>
      </section>
    </div>
  );
}
