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
  pricesOf,
} from '@/lib/data';
import { BRAND_INTRO } from '@/lib/content';
import { BRAND_ICON_COLOR, brandThemeVars } from '@/lib/colors';
import type { Branch } from '@/lib/types';
import type { CSSProperties } from 'react';

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
  const themeVars = brandThemeVars(brandKey) as CSSProperties;

  return (
    <div className="wrap page brand-themed" style={themeVars}>
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
        <span className="badge badge-brand">특별관 운영 {specialCount}곳</span>
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

      {/* 브랜드 설명 — 긴 문단 대신 3개 요약 카드로 (가이드 3.1, 스캔하기 쉽게) */}
      <section className="section" aria-labelledby="brand-guide">
        <h2 id="brand-guide">{info.name} 이용 전에 알아두면 좋은 것</h2>
        <ul className="brand-highlights">
          {intro.highlights.map((h) => (
            <li key={h.title}>
              <div className="bh-title">{h.title}</div>
              <p className="bh-desc">{h.desc}</p>
            </li>
          ))}
        </ul>
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
  const themeVars = brandThemeVars(b.brand) as CSSProperties;

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

  // 2단계(실제 콘텐츠 채우기) 미리보기 테스트. 서울강남-cgv 한 곳에서만
  // "준비 중" 안내 대신 실제 교통·주차·요금 정보를 보여준다.
  const isContentPreview = b.pageSlug === '서울강남-cgv';

  return (
    <div className="wrap page brand-themed" style={themeVars}>
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

      <section className="section" aria-labelledby="basic">
        <h2 id="basic">기본 정보</h2>
        <dl className="info-list">
          <div>
            <dt>주소</dt>
            <dd>
              <div className="address-row">
                <span className="address-text">{b.address}</span>
                {mapUrl && (
                  <a
                    className="map-button"
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      aria-hidden="true"
                    >
                      <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    지도에서 길찾기
                  </a>
                )}
              </div>
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

      {isContentPreview ? (
        <ContentPreview branch={b} />
      ) : (
        <section className="section" aria-labelledby="coming">
          <h2 id="coming">준비 중인 정보</h2>
          <div className="note" style={{ marginTop: 12 }}>
            이 지점의 <strong>대중교통 이용 방법, 주차 조건과 요금, 상영관별 관람료</strong>는
            현재 정리 중입니다. 아래 버튼으로 {info.name} 공식 페이지에서 확인하실 수 있습니다.
          </div>
        </section>
      )}

      {/* 예매·상영시간표는 우리 사이트가 아니라 공식 사이트의 일이다.
          우리 정보(기본정보 + 교통·주차·요금)를 다 읽은 다음, 그러나 인근 지점 링크보다는
          앞서 배치한다 — 다음 행동은 "여기 갈지 정하기"이지 "다른 지점 찾기"가 아니라서다.
          모바일에서는 화면 하단에 고정된다. */}
      <a className="schedule-bar" href={b.scheduleUrl} target="_blank" rel="noopener nofollow">
        <span className="sb-text">
          <span className="sb-title">
            {b.name} {info.name} 상영시간표
          </span>
          <span className="sb-sub">실시간 정보는 공식 사이트에서 확인됩니다</span>
        </span>
        <svg
          className="sb-arrow"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>

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

/**
 * 2단계 콘텐츠(실제 교통·주차·요금 정보) 미리보기.
 * 서울강남-cgv 한 곳에만 붙여서 "준비 중" 자리에 실제로 채우면 어떤 모습인지 확인하는 테스트안.
 * 425곳 전체로 확장할 때는 이 컴포넌트를 그대로 재사용하면 된다.
 */
function ContentPreview({ branch: b }: { branch: Branch }) {
  const rows = pricesOf(b.id);
  const byLabel = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = byLabel.get(r.label) ?? [];
    list.push(r);
    byLabel.set(r.label, list);
  }

  return (
    <>
      <span className="badge badge-brand" style={{ marginBottom: -8, display: 'inline-block' }}>
        테스트 미리보기 — 이 지점만 실제 정보로 채웠습니다
      </span>

      {(b.transit.raw || b.transit.bus || b.transit.subway) && (
        <section className="section" aria-labelledby="transit">
          <h2 id="transit">대중교통 이용 방법</h2>
          <div className="note" style={{ marginTop: 12, whiteSpace: 'pre-line' }}>
            {b.transit.raw ??
              [
                b.transit.subway && `[지하철]\n${b.transit.subway}`,
                b.transit.bus && `[버스]\n${b.transit.bus}`,
              ]
                .filter(Boolean)
                .join('\n\n')}
          </div>
        </section>
      )}

      {(b.parking.raw || b.parking.guide || b.parking.fee) && (
        <section className="section" aria-labelledby="parking">
          <h2 id="parking">주차 안내</h2>
          <div className="note" style={{ marginTop: 12, whiteSpace: 'pre-line' }}>
            {b.parking.raw ??
              [
                b.parking.guide && `[주차 위치]\n${b.parking.guide}`,
                b.parking.howTo && `[주차 확인]\n${b.parking.howTo}`,
                b.parking.fee && `[주차 요금]\n${b.parking.fee}`,
              ]
                .filter(Boolean)
                .join('\n\n')}
          </div>
        </section>
      )}

      {byLabel.size > 0 && (
        <section className="section" aria-labelledby="prices">
          <h2 id="prices">관람료</h2>
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>상영관</th>
                  <th>시간대</th>
                  <th>요일</th>
                  <th>성인</th>
                  <th>청소년</th>
                </tr>
              </thead>
              <tbody>
                {[...byLabel.entries()].map(([label, group]) =>
                  group.map((r, i) => (
                    <tr key={`${label}-${i}`}>
                      {i === 0 && <td rowSpan={group.length}>{label}</td>}
                      <td>{r.timeSlot ?? '-'}</td>
                      <td>{r.dayType}</td>
                      <td>{r.adult != null ? `${r.adult.toLocaleString()}원` : '-'}</td>
                      <td>{r.youth != null ? `${r.youth.toLocaleString()}원` : '-'}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
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
