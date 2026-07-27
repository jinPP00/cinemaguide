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
  hasFilledContent,
} from '@/lib/data';
import { BRAND_INTRO } from '@/lib/content';
import { BRAND_ICON_COLOR, BRAND_WORDMARK, brandThemeVars } from '@/lib/colors';
import { REGION_GROUPS } from '@/lib/regions';
import { IconClapper } from '../icons';
import type { Branch, PriceRow } from '@/lib/types';
import type { CSSProperties, ReactNode } from 'react';
import BoxOfficeSection from './BoxOfficeSection';

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
      title: `${info.name} 영화관 이용 안내`,
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
      // 아직 교통·주차·요금 본문을 채우지 못한 지점만 색인하지 않는다. (기획서 10.2)
      // 내용을 채우는 대로(현재 서울) hasFilledContent에 조건을 추가하고 색인으로 전환한다.
      robots: hasFilledContent(branch) ? undefined : { index: false, follow: true },
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

      <h1>{info.name} 영화관 이용 안내</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        {intro.lead}
      </p>

      <div className="badges" style={{ marginTop: 16 }}>
        <span className="badge">전국 {info.count}개 지점</span>
        <span className="badge">{sidos.length}개 시도</span>
        <span className="badge badge-brand">특별관 운영 {specialCount}곳</span>
      </div>

      <section className="section" aria-labelledby="branch-list">
        <h2 id="branch-list">전국 {info.name} 영화관 지역별 안내</h2>
        <div style={{ marginTop: 20 }}>
          {REGION_GROUPS.map((region) => {
            const regionSidos = region.sidos.filter((sido) => sidos.includes(sido));
            if (regionSidos.length === 0) return null;
            const regionCount = regionSidos.reduce(
              (sum, sido) => sum + branchesOfBrandSido(brandKey, sido).length,
              0,
            );
            return (
              <div className="region-block" key={region.name}>
                <div className="region-head">
                  <h3>{region.name}</h3>
                  <span className="count">{regionCount}곳</span>
                </div>
                {regionSidos.map((sido) => {
                  const list = branchesOfBrandSido(brandKey, sido);
                  return (
                    <div className="sido-block" key={sido}>
                      <div className="sido-head">
                        <h4>
                          <Link href={sidoPath(info.segment, sido)}>{sido}</Link>
                        </h4>
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
            const otherThemeVars = brandThemeVars(b.key) as CSSProperties;
            return (
              <Link
                key={b.key}
                href={brandPath(b.segment)}
                className="card brand-card brand-card--stripe"
                style={otherThemeVars}
              >
                <div className="brand-card-icon" style={{ color: iconColor.fg }}>
                  <IconClapper />
                </div>
                <div className="brand-wordmark" style={{ color: iconColor.fg }}>
                  {BRAND_WORDMARK[b.key]}
                </div>
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

  // 서울 지점은 "준비 중" 안내 대신 실제 교통·주차·요금 정보를 보여준다.
  // 나머지 지역은 순차적으로 hasFilledContent()의 조건을 넓혀가며 확장한다.
  const isContentPreview = hasFilledContent(b);

  // 예매·상영시간표는 우리 사이트가 아니라 공식 사이트의 일이다.
  // 콘텐츠 미리보기 지점에서는 관람료 다음, 대중교통 이용 방법 앞에 배치해
  // "우리 정보를 보다가 예매하러 갈지 정하는" 흐름에 자연스럽게 놓는다.
  // 준비 중인 지점은 안내문 바로 다음에 배치한다. 모바일에서는 화면 하단에 고정된다.
  const scheduleBar = (
    <div className="schedule-cta">
      <a className="schedule-button" href={b.scheduleUrl} target="_blank" rel="noopener nofollow">
        {b.name} {info.name} 상영시간표 확인
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
      <p className="schedule-caption">실시간 정보는 공식 사이트에서 확인됩니다</p>
    </div>
  );

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
        <ContentPreview branch={b} scheduleBar={scheduleBar} />
      ) : (
        <>
          <section className="section" aria-labelledby="coming">
            <h2 id="coming">준비 중인 정보</h2>
            <div className="note" style={{ marginTop: 12 }}>
              이 지점의 <strong>대중교통 이용 방법, 주차 조건과 요금, 상영관별 관람료</strong>는
              현재 정리 중입니다. 아래 버튼으로 {info.name} 공식 페이지에서 확인하실 수 있습니다.
            </div>
          </section>
          {scheduleBar}
        </>
      )}

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
          <p style={{ marginTop: 16 }}>
            <Link className="see-all-link" href={sidoPath(info.segment, b.sido)}>
              {b.sido} {info.name} 지점 전체 보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
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

/** "■ 항목명 ... ■ 다음항목명 ..." 형태의 원문을 항목별 카드로 쪼갠다 */
function splitByMarker(raw: string, marker: string): { title: string; body: string }[] {
  const chunks = raw.split(marker).map((c) => c.trim()).filter(Boolean);
  return chunks.map((chunk) => {
    const [firstLine, ...rest] = chunk.split('\n');
    return { title: firstLine.trim(), body: rest.join('\n').trim() };
  });
}

/**
 * "- 항목 ... : 부연설명 ... (참고)" 식으로 줄바꿈만 되어 있는 원문을
 * 읽기 쉬운 불릿 목록으로 바꾼다. "-"로 시작하는 줄만 새 항목이고,
 * 그 외 줄(":"로 시작하거나 그냥 이어지는 줄)은 앞 항목의 부연설명으로 붙인다.
 */
function toBullets(raw: string): { text: string; note?: string }[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const bullets: string[][] = [];
  for (const line of lines) {
    if (line.startsWith('-')) {
      bullets.push([line.replace(/^-\s*/, '')]);
    } else if (bullets.length > 0) {
      bullets[bullets.length - 1].push(line.replace(/^:\s*/, ''));
    } else {
      bullets.push([line]);
    }
  }
  return bullets.map(([text, ...rest]) => ({ text, note: rest.join(' ') || undefined }));
}

function BulletList({ text }: { text: string }) {
  return (
    <ul className="transit-bullets">
      {toBullets(text).map((item, i) => (
        <li key={i}>
          <span className="tb-text">{item.text}</span>
          {item.note && <span className="tb-note">{item.note}</span>}
        </li>
      ))}
    </ul>
  );
}

/** 요금 행을 상영관(label)별로 묶고, 그 안에서 시간대별 평일·주말 한 행으로 합친다 */
function pivotPrices(rows: PriceRow[]) {
  const byLabel = new Map<string, Map<string, { wkday?: PriceRow; wkend?: PriceRow }>>();
  for (const r of rows) {
    const bySlot = byLabel.get(r.label) ?? new Map();
    const slotKey = r.timeSlot ?? '-';
    const entry = bySlot.get(slotKey) ?? {};
    if (r.dayType === '평일') entry.wkday = r;
    else entry.wkend = r;
    bySlot.set(slotKey, entry);
    byLabel.set(r.label, bySlot);
  }
  return [...byLabel.entries()].map(([label, bySlot]) => ({
    label,
    slots: [...bySlot.entries()].map(([timeSlot, v]) => ({ timeSlot, ...v })),
  }));
}

const won = (n: number | null | undefined) => (n != null ? n.toLocaleString() : '-');

const IconSubway = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="4" y="3" width="16" height="14" rx="4" />
    <path d="M4 11h16M8 17l-2 4M16 17l2 4" />
    <circle cx="8.5" cy="14" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="14" r="0.6" fill="currentColor" />
  </svg>
);
const IconBus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M3 11h18M7 16l-1.5 3M17 16l1.5 3" />
    <circle cx="7" cy="13.2" r="0.6" fill="currentColor" />
    <circle cx="17" cy="13.2" r="0.6" fill="currentColor" />
  </svg>
);
const IconParking = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 16V7h3.5a2.5 2.5 0 0 1 0 5H9" />
  </svg>
);
const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M9 6v12" strokeDasharray="2.5 2.5" />
  </svg>
);
const IconCoin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.5c0-1.4 1.2-2.2 2.5-2.2s2.5.7 2.5 1.8c0 2.6-5 1.6-5 4.3 0 1.2 1.2 1.8 2.5 1.8s2.5-.8 2.5-2.1" />
  </svg>
);

/**
 * 2단계 콘텐츠 — 실제 교통·주차·요금 정보. hasFilledContent()가 true인
 * 지점(현재 서울 70곳)에서 "준비 중" 안내 대신 이 컴포넌트를 쓴다.
 * 다른 지역으로 넓힐 때도 이 컴포넌트를 그대로 재사용하면 된다.
 */
function ContentPreview({ branch: b, scheduleBar }: { branch: Branch; scheduleBar: ReactNode }) {
  const priceGroups = pivotPrices(pricesOf(b.id));

  // CGV는 "# 지하철 ... # 버스 ..." 원문 한 덩어리라 마커로 쪼개고,
  // 롯데·메가박스처럼 이미 나뉜 데이터는 그대로 쓴다.
  const subway = b.transit.subway ?? splitByMarker(b.transit.raw ?? '', '#').find((s) => s.title.includes('지하철'))?.body;
  const bus = b.transit.bus ?? splitByMarker(b.transit.raw ?? '', '#').find((s) => s.title.includes('버스'))?.body;

  const parkingSections = b.parking.raw
    ? splitByMarker(b.parking.raw, '■')
    : [
        b.parking.guide && { title: '주차안내', body: b.parking.guide },
        b.parking.howTo && { title: '주차확인', body: b.parking.howTo },
        b.parking.fee && { title: '주차요금', body: b.parking.fee },
      ].filter((x): x is { title: string; body: string } => Boolean(x));

  const parkingIcon = (title: string) =>
    title.includes('요금') ? <IconCoin /> : title.includes('확인') ? <IconTicket /> : <IconParking />;

  return (
    <>
      <BoxOfficeSection />

      {priceGroups.length > 0 && (
        <section className="section" aria-labelledby="prices">
          <h2 id="prices">관람료</h2>
          <p className="card-sub" style={{ marginTop: 4 }}>금액은 성인 · 청소년 순서입니다</p>
          <div className="price-grid">
            {priceGroups.map((g) => (
              <div className="price-card" key={g.label}>
                <div className="price-card-title">{g.label}</div>
                <table className="price-mini">
                  <thead>
                    <tr>
                      <th></th>
                      <th>평일</th>
                      <th>주말</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.slots.map((s) => (
                      <tr key={s.timeSlot}>
                        <th>{s.timeSlot}</th>
                        <td>
                          {won(s.wkday?.adult)}
                          <span className="price-youth"> · {won(s.wkday?.youth)}</span>
                        </td>
                        <td>
                          {won(s.wkend?.adult)}
                          <span className="price-youth"> · {won(s.wkend?.youth)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      )}

      {scheduleBar}

      {(subway || bus) && (
        <section className="section" aria-labelledby="transit">
          <h2 id="transit">대중교통 이용 방법</h2>
          <div className="transit-grid">
            {subway && (
              <div className="transit-card">
                <div className="transit-card-head">
                  <IconSubway />
                  지하철
                </div>
                <BulletList text={subway} />
              </div>
            )}
            {bus && (
              <div className="transit-card">
                <div className="transit-card-head">
                  <IconBus />
                  버스
                </div>
                <BulletList text={bus} />
              </div>
            )}
          </div>
        </section>
      )}

      {parkingSections.length > 0 && (
        <section className="section" aria-labelledby="parking">
          <h2 id="parking">주차 안내</h2>
          <div className="transit-grid">
            {parkingSections.map((s) => (
              <div className="transit-card" key={s.title}>
                <div className="transit-card-head">
                  {parkingIcon(s.title)}
                  {s.title}
                </div>
                <BulletList text={s.body} />
              </div>
            ))}
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
