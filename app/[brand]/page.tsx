import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  meta,
  brandBySegment,
  brandMeta,
  branchesOfBrand,
  branchesOfBrandSido,
  sidosOfBrand,
  brandPath,
  sidoPath,
  branchPath,
} from '@/lib/data';
import { BRAND_INTRO } from '@/lib/content';

/** 브랜드 3개를 정적 생성한다 (cgv / 롯데시네마 / 메가박스) */
export function generateStaticParams() {
  return meta.brands.map((b) => ({ brand: b.segment }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const key = brandBySegment(brand);
  if (!key) return {};
  const info = brandMeta(key);
  return {
    title: `${info.name} 전국 지점 목록과 이용 안내`,
    description: `${info.name} 전국 ${info.count}개 지점의 위치와 상영시간표, 주차, 관람료 정보를 지역별로 정리했습니다.`,
    alternates: { canonical: brandPath(info.segment) },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const key = brandBySegment(brand);
  if (!key) notFound();

  const info = brandMeta(key);
  const intro = BRAND_INTRO[key];
  const sidos = sidosOfBrand(key);
  const all = branchesOfBrand(key);
  const specialCount = all.filter((b) => b.specialScreens.length > 0).length;
  const others = meta.brands.filter((b) => b.key !== key);

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>{info.name}</li>
        </ol>
      </nav>

      <h1>{info.name} 전국 지점 목록과 이용 안내</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        {intro.lead}
      </p>

      <div className="badges" style={{ marginTop: 16 }}>
        <span className="badge">전국 {info.count}개 지점</span>
        <span className="badge">{sidos.length}개 시도</span>
        <span className="badge">특별관 운영 {specialCount}곳</span>
      </div>

      {/* 시도별 지점 목록 */}
      <section className="section" aria-labelledby="branch-list">
        <h2 id="branch-list">지역별 지점</h2>
        <div style={{ marginTop: 20 }}>
          {sidos.map((sido) => {
            const list = branchesOfBrandSido(key, sido);
            return (
              <div className="sido-block" key={sido}>
                <div className="sido-head">
                  <h3>
                    <Link href={sidoPath(info.segment, sido)}>{sido}</Link>
                  </h3>
                  <span className="count">{list.length}곳</span>
                </div>
                <ul className="chip-list">
                  {list.map((b) => (
                    <li key={b.id}>
                      <Link className="chip" href={branchPath(b)}>
                        {b.name}
                        {b.status === '휴관' && (
                          <span style={{ color: '#b42318' }}> (휴관)</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 브랜드 설명 본문 (가이드 3.1 — 목록만 있는 얇은 페이지 방지) */}
      <section className="section" aria-labelledby="brand-guide">
        <h2 id="brand-guide">{info.name} 이용 전에 알아두면 좋은 것</h2>
        <div style={{ marginTop: 12, maxWidth: '68ch' }}>
          {intro.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="other-brands">
        <h2 id="other-brands">다른 브랜드 지점 보기</h2>
        <div className="card-grid cols-2" style={{ marginTop: 16 }}>
          {others.map((b) => (
            <Link
              key={b.key}
              href={brandPath(b.segment)}
              className={`card brand-card brand-${b.key}`}
            >
              <div className="card-title">{b.name}</div>
              <div className="card-sub">전국 {b.count}개 지점</div>
              <div className="card-more">지점 보기 →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="note">
          {info.name} 지점 정보는 공식 사이트에서 수집해 정리했으며 마지막 확인일은{' '}
          {meta.checkedAt}입니다. 본 사이트는 {info.name} 공식 서비스와 무관합니다.
        </div>
      </section>
    </div>
  );
}
