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

/** 브랜드 × 시도 조합을 전부 정적 생성한다 (지점이 있는 조합만) */
export function generateStaticParams() {
  return meta.brands.flatMap((b) =>
    sidosOfBrand(b.key).map((sido) => ({ brand: b.segment, sido })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; sido: string }>;
}): Promise<Metadata> {
  const { brand, sido: sidoRaw } = await params;
  const key = brandBySegment(brand);
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
  params: Promise<{ brand: string; sido: string }>;
}) {
  const { brand, sido: sidoRaw } = await params;
  const key = brandBySegment(brand);
  if (!key) notFound();

  const sido = decodeURIComponent(sidoRaw);
  const info = brandMeta(key);
  const list = branchesOfBrandSido(key, sido);
  if (list.length === 0) notFound();

  const specialCount = list.filter((b) => b.specialScreens.length > 0).length;
  const cityCount = new Set(list.map((b) => b.sigungu).filter(Boolean)).size;

  // 지점이 적은 지역은 인접 지역을 크게 노출해 빈약한 페이지가 되지 않게 한다 (기획서 5.3)
  const isSmall = list.length <= 2;
  const nearby = sidosOfBrand(key).filter((s) => s !== sido);

  return (
    <div className="wrap page">
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
        <h2 id="branches">지점 목록</h2>
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
                {s}{' '}
                <span style={{ color: 'var(--ink-faint)' }}>
                  {meta.byBrandSido[key]?.[s] ?? 0}
                </span>
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
                <Link
                  key={b.key}
                  href={sidoPath(b.segment, sido)}
                  className={`card brand-card brand-${b.key}`}
                >
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
          지점 정보 마지막 확인일은 {meta.checkedAt}입니다. 상영시간표와 요금은 변경될 수 있으므로
          방문 전 공식 채널에서 확인하시기 바랍니다.
        </div>
      </section>
    </div>
  );
}
