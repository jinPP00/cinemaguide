import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  meta,
  brandBySegment,
  brandMeta,
  branchesOfBrandSido,
  sidosOfBrand,
  brandPath,
  sidoPath,
  branchPath,
} from '@/lib/data';
import { sidoIntro } from '@/lib/content';
import { guidePath, GUIDES } from '@/lib/paths';
import { brandFareSummaries, won } from '@/lib/fares';
import { screensInBranches } from '@/lib/screens';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';
import { brandThemeVars } from '@/lib/colors';
import type { CSSProperties } from 'react';

/**
 * 이 라우트는 브랜드 허브([slug]/page.tsx)와 같은 동적 세그먼트 이름(slug)을 공유해야 한다.
 * Next.js는 같은 계층에 서로 다른 이름의 동적 폴더를 둘 수 없다.
 * 실제로는 [slug]가 브랜드일 때만(cgv/롯데시네마/메가박스) 이 페이지가 존재한다.
 */
export function generateStaticParams() {
  return meta.brands.flatMap((b) =>
    sidosOfBrand(b.key).map((sido) => ({ slug: b.segment, sido })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sido: string }>;
}): Promise<Metadata> {
  const { slug, sido: sidoRaw } = await params;
  const key = brandBySegment(slug);
  if (!key) return {};
  const sido = decodeURIComponent(sidoRaw);
  const info = brandMeta(key);
  const count = branchesOfBrandSido(key, sido).length;

  return {
    title: `${sido} ${info.name} 지점 ${count}곳 위치와 상영시간표 안내`,
    description: `${sido} 지역 ${info.name} 지점 ${count}곳의 주소와 가는 길, 주차 조건, 관람료 정보를 정리했습니다. 지점별 공식 상영시간표로 바로 이동할 수 있습니다.`,
    alternates: { canonical: sidoPath(info.segment, sido) },
  };
}

export default async function SidoPage({
  params,
}: {
  params: Promise<{ slug: string; sido: string }>;
}) {
  const { slug, sido: sidoRaw } = await params;
  const key = brandBySegment(slug);
  if (!key) notFound();

  const sido = decodeURIComponent(sidoRaw);
  const info = brandMeta(key);
  const list = branchesOfBrandSido(key, sido);
  if (list.length === 0) notFound();

  const specialCount = list.filter((b) => b.specialScreens.length > 0).length;
  const cityCount = new Set(list.map((b) => b.sigungu).filter(Boolean)).size;

  // 이 지역 요금·특별관 — 지점 목록만으로는 알 수 없는 내용을 채운다
  const summaries = brandFareSummaries(sido);
  const fare = summaries.find((s) => s.brand === key) ?? null;
  const screens = screensInBranches(list);

  // 시·군·구로 묶는다. 경기 CGV는 52곳이 27개 시군구에 흩어져 있어서 한 줄로
  // 늘어놓으면 "우리 동네에 있나"를 찾을 수가 없다. 시군구가 두 곳 이하면
  // 묶어봐야 그냥 목록이라 평면으로 둔다.
  const byCity = new Map<string, typeof list>();
  for (const b of list) {
    const city = b.sigungu?.trim() || sido;
    byCity.set(city, [...(byCity.get(city) ?? []), b]);
  }
  const cities = [...byCity.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ko'));
  const groupByCity = cities.length >= 3;

  // 지점이 적은 지역은 인접 지역을 크게 노출해 빈약한 페이지가 되지 않게 한다 (기획서 5.3)
  const isSmall = list.length <= 2;
  const nearby = sidosOfBrand(key).filter((s) => s !== sido);
  const themeVars = brandThemeVars(key) as CSSProperties;

  // 화면의 빵부스러기와 같은 순서·같은 이름으로 구조화 데이터를 만든다.
  const crumbs = [
    { name: '홈', path: '/' },
    { name: info.name, path: brandPath(info.segment) },
    { name: sido, path: sidoPath(info.segment, sido) },
  ];

  return (
    <div className="wrap page brand-themed" style={themeVars}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(sidoPath(info.segment, sido), dataGeneratedAt.toISOString()),
        )}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href={brandPath(info.segment)}>{info.name}</Link>
          </li>
          <li>{sido}</li>
        </ol>
      </nav>

      <h1>
        {sido} {info.name} 지점 {list.length}곳
      </h1>

      <p className="lead" style={{ marginTop: 12 }}>
        {sidoIntro(info.name, sido, list.length, specialCount, cityCount)}
      </p>

      {/* 지점 목록 */}
      <section className="section" aria-labelledby="branches">
        <h2 id="branches">
          {groupByCity ? `시·군·구별 지점 (${cities.length}곳)` : '지점 목록'}
        </h2>
        {groupByCity &&
          cities.map(([city, group]) => (
            <div key={city} className="city-group">
              <h3 className="city-group-head">
                {city} <span className="count">{group.length}곳</span>
              </h3>
              <ul className="chip-list">
                {group.map((b) => (
                  <li key={b.id}>
                    <Link className="chip" href={branchPath(b)}>
                      {b.name}
                      {b.status === '휴관' && ' (휴관)'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <div className="card-grid cols-2" style={{ marginTop: 16 }}>
          {list.map((b) => (
            <Link key={b.id} href={branchPath(b)} className="card">
              <div className="card-title">
                {b.name} {info.name}
              </div>
              <div className="card-sub">{b.address}</div>
              {(b.specialScreens.length > 0 || b.status === '휴관') && (
                <div className="badges">
                  {b.status === '휴관' && (
                    <span className="badge badge-closed">휴관</span>
                  )}
                  {b.specialScreens.slice(0, 3).map((s) => (
                    <span key={s} className="badge">
                      {s}
                    </span>
                  ))}
                  {b.specialScreens.length > 3 && (
                    <span className="badge">외 {b.specialScreens.length - 3}</span>
                  )}
                </div>
              )}
              <div className="card-more">지점 정보 보기 →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 여기부터는 지점 목록만으로는 알 수 없는 것 — 이 지역에서 얼마를 내고
          무엇을 볼 수 있는지. 값은 전부 data/prices.json·specialScreens에서
          계산하므로 지역마다 다른 내용이 나온다. */}
      {fare && (
        <section className="section" aria-labelledby="sido-fare">
          <h2 id="sido-fare">{sido} {info.name} 관람료</h2>
          <p className="card-sub" style={{ marginTop: 4 }}>
            일반 상영관 2D, 일반 시간대, 성인 기준입니다.
          </p>
          <div className="table-scroll" style={{ marginTop: 14 }}>
            <table className="fare-table">
              <thead>
                <tr>
                  <th scope="col">구분</th>
                  <th scope="col">평일</th>
                  <th scope="col">주말</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">대표 요금</th>
                  <td>{won(fare.weekdayCommon)}</td>
                  <td>{won(fare.weekendCommon)}</td>
                </tr>
                {fare.weekdayLow !== fare.weekdayHigh && (
                  <tr>
                    <th scope="row">지점별 범위</th>
                    <td colSpan={2} className="fare-range">
                      {won(fare.weekdayLow)} ~ {won(fare.weekdayHigh)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 14, color: 'var(--ink-soft)' }}>
            지점별 실제 관람료는 상영관과 시간대에 따라 달라질 수 있습니다. 각 지점의 상세 요금은
            지점 페이지에서 확인하고, 브랜드 간 비교는{' '}
            <Link href={guidePath(GUIDES.fares)}>관람료 비교</Link>를 참고하세요.
          </p>
        </section>
      )}

      {screens.length > 0 && (
        <section className="section" aria-labelledby="sido-screens">
          <h2 id="sido-screens">{sido}에서 볼 수 있는 특별관</h2>
          <p className="card-sub" style={{ marginTop: 4 }}>
            {sido} 지역 {info.name} 지점 {specialCount}곳이 특별관을 함께 운영합니다.
          </p>
          <dl className="screen-notes" style={{ marginTop: 14 }}>
            {screens.map((s) => (
              <div key={s.name}>
                <dt>
                  {s.name} <span className="fare-note">{s.branches.length}곳</span>
                </dt>
                <dd>
                  {s.branches.map((b, i) => (
                    <span key={b.id}>
                      {i > 0 && ' · '}
                      <Link href={branchPath(b)}>{b.name}</Link>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="card-sub" style={{ marginTop: 14 }}>
            상영관별 추가요금은 <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>에
            정리했습니다.
          </p>
        </section>
      )}

      {/* 지점이 적은 지역은 주변 지역을 크게, 많은 지역은 링크만 */}
      <section className="section" aria-labelledby="nearby">
        <h2 id="nearby">{isSmall ? '가까운 다른 지역 지점 찾기' : '다른 지역 보기'}</h2>
        {isSmall && (
          <p className="card-sub" style={{ marginTop: 6 }}>
            {sido} 지역에 {info.name} 지점이 많지 않습니다. 인접 지역 지점도 함께 확인해보세요.
          </p>
        )}
        <ul className="chip-list" style={{ marginTop: 14 }}>
          {nearby.map((s) => (
            <li key={s}>
              <Link className="chip" href={sidoPath(info.segment, s)}>
                {s} <span style={{ opacity: 0.7 }}>{meta.byBrandSido[key]?.[s] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 다른 브랜드의 같은 지역 — 지역 기준으로 찾는 사용자를 위한 동선 */}
      <section className="section" aria-labelledby="other-brand-same-sido">
        <h2 id="other-brand-same-sido">{sido} 지역 다른 브랜드</h2>
        <div className="card-grid cols-2" style={{ marginTop: 16 }}>
          {meta.brands
            .filter((b) => b.key !== key)
            .map((b) => {
              const n = meta.byBrandSido[b.key]?.[sido] ?? 0;
              if (n === 0) return null;
              return (
                <Link key={b.key} href={sidoPath(b.segment, sido)} className="card">
                  <div className="card-title">
                    {sido} {b.name}
                  </div>
                  <div className="card-sub">{n}개 지점</div>
                  <div className="card-more">지점 보기 →</div>
                </Link>
              );
            })}
        </div>
      </section>

      <section className="section">
        <div className="note">
          상영시간표와 요금은 변경될 수 있으므로 방문 전 공식 채널에서 확인하시기 바랍니다.
        </div>
      </section>
    </div>
  );
}
