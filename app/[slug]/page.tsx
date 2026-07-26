import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  meta,
  branches,
  brandBySegment,
  brandMeta,
  branchesOfBrand,
  branchesOfBrandSido,
  sidosOfBrand,
  findBranchByPageSlug,
  brandPath,
  sidoPath,
  branchPath,
} from '@/lib/data';
import { BRAND_INTRO } from '@/lib/content';
import { BRAND_ICON_COLOR } from '@/lib/colors';
import type { Branch } from '@/lib/types';

/**
 * 이 라우트 하나가 두 가지 페이지를 모두 담당한다: 브랜드 허브(/cgv/)와 지점 상세
 * (/서울강남-cgv/). 둘 다 사이트 최상위 한 단계 경로라 Next.js에서 같은 동적 세그먼트를
 * 써야 하므로 여기서 값을 보고 분기한다.
 */
export function generateStaticParams() {
  const brandParams = meta.brands.map((b) => ({ slug: b.segment }));
  const branchParams = branches.map((b) => ({ slug: b.pageSlug }));
  return [...brandParams, ...branchParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const brandKey = brandBySegment(decoded);
  if (brandKey) {
    const info = brandMeta(brandKey);
    return {
      title: `${info.name} 전국 지점 목록과 이용 안내`,
      description: `${info.name} 전국 ${info.count}개 지점의 위치와 상영시간표, 주차, 관람료 정보를 지역별로 정리했습니다.`,
      alternates: { canonical: brandPath(info.segment) },
    };
  }

  const branch = findBranchByPageSlug(decoded);
  if (branch) {
    return {
      title: `${branch.name} ${branch.brandName} 상영시간표·주차·관람료 안내`,
      description: `${branch.name} ${branch.brandName}의 위치와 가는 길, 주차 조건, 관람료 정보입니다. 공식 상영시간표로 바로 이동할 수 있습니다.`,
      alternates: { canonical: branchPath(branch) },
      // 1단계에서는 상세 내용이 아직 없으므로 색인하지 않는다. (기획서 10.2)
      // 교통·주차·요금 본문을 채운 뒤 이 설정을 제거하고 색인으로 전환한다.
      robots: { index: false, follow: true },
    };
  }

  return {};
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const brandKey = brandBySegment(decoded);
  if (brandKey) return <BrandHub brandKey={brandKey} />;

  const branch = findBranchByPageSlug(decoded);
  if (branch) return <BranchDetail branch={branch} />;

  notFound();
}

/* ------------------------------------------------------------------ *
 * 브랜드 허브
 * ------------------------------------------------------------------ */
function BrandHub({ brandKey }: { brandKey: Parameters<typeof brandMeta>[0] }) {
  const info = brandMeta(brandKey);
  const intro = BRAND_INTRO[brandKey];
  const sidos = sidosOfBrand(brandKey);
  const all = branchesOfBrand(brandKey);
  const specialCount = all.filter((b) => b.specialScreens.length > 0).length;
  const others = meta.brands.filter((b) => b.key !== brandKey);

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

      <section className="section" aria-labelledby="branch-list">
        <h2 id="branch-list">지역별 지점</h2>
        <div style={{ marginTop: 20 }}>
          {sidos.map((sido) => {
            const list = branchesOfBrandSido(brandKey, sido);
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

      {/* 브랜드 설명 본문 — 하나의 흐르는 문단으로 구성 (가이드 3.1, 문단 분절 방지) */}
      <section className="section" aria-labelledby="brand-guide">
        <h2 id="brand-guide">{info.name} 이용 전에 알아두면 좋은 것</h2>
        <p style={{ marginTop: 12, maxWidth: '68ch' }}>{intro.body}</p>
      </section>

      <section className="section" aria-labelledby="other-brands">
        <h2 id="other-brands">다른 브랜드 지점 보기</h2>
        <div className="card-grid cols-2" style={{ marginTop: 16 }}>
          {others.map((b) => {
            const iconColor = BRAND_ICON_COLOR[b.key];
            return (
              <Link key={b.key} href={brandPath(b.segment)} className="card brand-card">
                <div
                  className="brand-icon"
                  style={{ background: iconColor.bg, color: iconColor.fg }}
                  aria-hidden="true"
                >
                  {b.name[0]}
                </div>
                <div className="card-title">{b.name}</div>
                <div className="card-sub">전국 {b.count}개 지점</div>
                <div className="card-more">지점 보기 →</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="note">
          {info.name} 지점 정보는 공식 사이트에서 수집해 정리했습니다. 본 사이트는 {info.name}{' '}
          공식 서비스와 무관합니다.
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 지점 상세
 * ------------------------------------------------------------------ */
function BranchDetail({ branch: b }: { branch: Branch }) {
  const info = brandMeta(b.brand);

  const siblings = branchesOfBrandSido(b.brand, b.sido)
    .filter((x) => x.id !== b.id)
    .slice(0, 6);

  const mapUrl =
    b.mapLink ??
    (b.lat && b.lng
      ? `https://map.naver.com/p/search/${encodeURIComponent(
          `${b.brandName} ${b.name}`,
        )}?c=${b.lng},${b.lat},15,0,0,0,dh`
      : null);

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
          <li>
            <Link href={sidoPath(info.segment, b.sido)}>{b.sido}</Link>
          </li>
          <li>{b.name}</li>
        </ol>
      </nav>

      <h1>
        {b.name} {info.name} 상영시간표·주차·관람료 안내
      </h1>

      {b.status === '휴관' && (
        <p className="notice-closed">
          이 지점은 현재 <strong>휴관</strong> 중입니다. 운영 재개 여부는 공식 사이트에서
          확인하시기 바랍니다.
        </p>
      )}

      <div className="cta-box">
        <div className="cta-text">
          <strong>오늘 상영시간표 보기</strong>
          <span>실시간 상영시간표는 {info.name} 공식 사이트에서 제공됩니다.</span>
        </div>
        <a className="cta-button" href={b.scheduleUrl} target="_blank" rel="noopener nofollow">
          공식 상영시간표 열기 →
        </a>
      </div>

      <section className="section" aria-labelledby="basic">
        <h2 id="basic">기본 정보</h2>
        <dl className="info-list">
          <div>
            <dt>주소</dt>
            <dd>
              {b.address}
              {mapUrl && (
                <>
                  {' '}
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                    지도에서 보기
                  </a>
                </>
              )}
            </dd>
          </div>
          {b.tel && (
            <div>
              <dt>전화</dt>
              <dd>
                <a href={`tel:${b.tel}`}>{formatTel(b.tel)}</a>
              </dd>
            </div>
          )}
          {b.specialScreens.length > 0 && (
            <div>
              <dt>특별관</dt>
              <dd>{b.specialScreens.join(', ')}</dd>
            </div>
          )}
          {b.screenCount != null && (
            <div>
              <dt>상영관</dt>
              <dd>
                {b.screenCount}개관
                {b.seatCount != null && ` · 총 ${b.seatCount.toLocaleString()}석`}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="section" aria-labelledby="coming">
        <h2 id="coming">준비 중인 정보</h2>
        <div className="note" style={{ marginTop: 12 }}>
          이 지점의 <strong>대중교통 이용 방법, 주차 조건과 요금, 상영관별 관람료</strong>는
          현재 정리 중입니다. 그전까지는 위 버튼으로 {info.name} 공식 페이지에서 확인하실 수
          있습니다.
        </div>
      </section>

      <section className="section" aria-labelledby="official">
        <h2 id="official">공식 사이트</h2>
        <p className="card-sub" style={{ marginTop: 6 }}>
          예매와 최신 정보는 공식 페이지에서 확인하세요.
        </p>
        <a
          className="chip"
          href={b.officialUrl}
          target="_blank"
          rel="noopener nofollow"
          style={{ marginTop: 10, display: 'inline-block' }}
        >
          {info.name} {b.name} 공식 페이지 →
        </a>
      </section>

      {siblings.length > 0 && (
        <section className="section" aria-labelledby="siblings">
          <h2 id="siblings">
            {b.sido} 지역 다른 {info.name} 지점
          </h2>
          <ul className="chip-list" style={{ marginTop: 14 }}>
            {siblings.map((s) => (
              <li key={s.id}>
                <Link className="chip" href={branchPath(s)}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 14 }}>
            <Link href={sidoPath(info.segment, b.sido)}>
              {b.sido} {info.name} 지점 전체 보기 →
            </Link>
          </p>
        </section>
      )}

      <section className="section">
        <div className="note">
          본 사이트는 {info.name} 공식 서비스와 무관한 비공식 정보 안내 사이트입니다. 잘못된
          정보를 발견하셨다면 <Link href="/contact/">정정 요청</Link>으로 알려주세요.
        </div>
      </section>
    </div>
  );
}

/** 0212345678 → 02-1234-5678 형태로 보기 좋게 */
function formatTel(tel: string): string {
  const d = tel.replace(/\D/g, '');
  if (d.startsWith('02') && d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.startsWith('02') && d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return tel;
}
