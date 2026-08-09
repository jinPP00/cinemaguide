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
import { SITE } from '@/lib/site';
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt, branchLastModified } from '@/lib/dates';
import { BRAND_ICON_COLOR, BRAND_WORDMARK, brandThemeVars } from '@/lib/colors';
import { REGION_GROUPS } from '@/lib/regions';
import { IconClapper } from '../icons';
import type { Branch, BoxOffice, PriceRow } from '@/lib/types';
import type { CSSProperties, ReactNode } from 'react';
import BoxOfficeSection from './BoxOfficeSection';
// 빌드 시점에 읽어 정적 HTML에 그대로 굽는다. 브라우저 fetch로 두면 JS를 실행하지
// 않는 LLM 크롤러에게 이 섹션이 통째로 비어 보인다. (BoxOfficeSection 주석 참고)
import boxofficeData from '../../public/boxoffice.json';

const boxoffice = boxofficeData as BoxOffice;

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
      title: `${info.name} 상영시간표·전국 지점 안내`,
      description: `${info.name} 상영시간표를 지점별로 확인하는 방법과 전국 ${info.count}개 지점의 위치, 교통, 주차, 관람료 정보를 지역별로 정리했습니다.`,
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

  // 화면의 빵부스러기와 같은 순서·같은 이름으로 구조화 데이터를 만든다.
  const crumbs = [
    { name: '홈', path: '/' },
    { name: info.name, path: brandPath(info.segment) },
  ];

  return (
    <div className="wrap page brand-themed" style={themeVars}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(brandPath(info.segment), dataGeneratedAt.toISOString()),
        )}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>{info.name}</li>
        </ol>
      </nav>

      <h1>{info.name} 상영시간표·전국 지점 안내</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        {intro.lead}
      </p>

      <div className="badges" style={{ marginTop: 16 }}>
        <span className="badge">전국 {info.count}개 지점</span>
        <span className="badge">{sidos.length}개 시도</span>
        <span className="badge badge-brand">특별관 운영 {specialCount}곳</span>
      </div>

      {/* 시도 바로가기 — 지점 목록이 지역 순서라 먼 지역 사용자는 한참 스크롤해야 했다.
          첫 화면에서 한 번에 원하는 시도로 넘어가게 하는 퀵링크 겸, 시도 페이지로 가는
          내부 링크를 늘리는 역할도 한다. */}
      <nav className="sido-quicklinks" aria-label={`${info.name} 시도별 바로가기`}>
        <ul className="chip-list">
          {sidos.map((sido) => (
            <li key={sido}>
              <Link className="chip" href={sidoPath(info.segment, sido)}>
                {sido}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

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

      {/* 제목에 "상영시간표"를 넣은 만큼 본문도 그 검색 의도를 실제로 해결해야 한다.
          실시간 시간표는 공식 사이트가 제공한다는 점을 숨기지 않고 밝히고, 대신 이
          사이트가 보태는 것(방문 전 교통·주차·요금 확인)을 흐름으로 안내한다.
          위치는 지점 목록 "아래" — 위에 두면 목록이 첫 화면 밖으로 밀려나고,
          1단계 내용이 "목록에서 지점을 고르세요"라 목록을 본 뒤 읽는 게 순서에 맞다. */}
      <section className="section" aria-labelledby="how-schedule">
        <h2 id="how-schedule">{info.name} 상영시간표 확인 방법</h2>
        <p className="lead" style={{ marginTop: 12 }}>
          실시간 상영시간표와 예매는 {info.name} 공식 사이트에서 제공됩니다. 이 사이트에서는
          방문할 지점을 먼저 정하고, 가는 길과 주차 조건, 관람료를 미리 확인한 뒤 공식
          상영시간표로 바로 이동할 수 있습니다.
        </p>
        <ol className="how-steps">
          <li>
            <span className="how-num">1</span>
            <div>
              <div className="how-title">방문할 지점을 고르세요</div>
              <p className="how-desc">
                위 지역별 목록에서 전국 {info.count}개 {info.name} 지점 중 가까운 곳을 찾을 수
                있습니다.
              </p>
            </div>
          </li>
          <li>
            <span className="how-num">2</span>
            <div>
              <div className="how-title">가는 길과 요금을 미리 확인하세요</div>
              <p className="how-desc">
                지점 페이지에서 지하철·버스 노선, 주차 무료 시간과 초과 요금, 상영관별 관람료를
                한 화면에서 볼 수 있습니다.
              </p>
            </div>
          </li>
          <li>
            <span className="how-num">3</span>
            <div>
              <div className="how-title">공식 상영시간표로 이동하세요</div>
              <p className="how-desc">
                각 지점 페이지의 &lsquo;상영시간표 확인&rsquo; 버튼을 누르면 해당 지점의 공식
                시간표 페이지로 바로 연결됩니다.
              </p>
            </div>
          </li>
        </ol>
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

  // 지점 데이터로 자주 묻는 질문을 만든다. 값이 없는 항목은 아예 넣지 않는다 —
  // "확인 필요" 같은 빈 답을 FAQ로 내보내면 검색·AI 답변에 쓸모없는 내용이 실린다.
  const faqs = buildBranchFaqs(b, info.name);

  const crumbs = [
    { name: '홈', path: '/' },
    { name: info.name, path: brandPath(info.segment) },
    { name: b.sido, path: sidoPath(info.segment, b.sido) },
    { name: b.name, path: branchPath(b) },
  ];

  const theaterJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MovieTheater',
    name: `${b.name} ${info.name}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressRegion: b.sido,
      addressCountry: 'KR',
    },
    ...(b.tel ? { telephone: b.tel } : {}),
    ...(b.lat && b.lng ? { geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng } } : {}),
    url: `${SITE.url}${branchPath(b)}`,
  };

  return (
    <div className="wrap page brand-themed" style={themeVars}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          theaterJsonLd,
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(branchPath(b), branchLastModified(b.checkedAt).toISOString()),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
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
          <li>
            <Link href={sidoPath(info.segment, b.sido)}>{b.sido}</Link>
          </li>
          <li>{b.name}</li>
        </ol>
      </nav>

      <h1>
        {b.name} {info.name} 상영시간표·주차·관람료 안내
      </h1>

      {b.intro && (
        <p className="lead" style={{ marginTop: 12 }}>
          {b.intro}
        </p>
      )}

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

      {b.facility && (b.facility.screens?.length || b.facility.floors?.length) && (
        <section className="section" aria-labelledby="facility">
          <h2 id="facility">상영관 안내</h2>
          {b.facility.screens && b.facility.screens.length > 0 && (
            <p className="card-sub" style={{ marginTop: 4 }}>
              {b.facility.screens.join(', ')}
            </p>
          )}
          {b.facility.floors && b.facility.floors.length > 0 && (
            <ul className="transit-bullets" style={{ marginTop: 12 }}>
              {b.facility.floors.map((line, i) => (
                <li key={i}>
                  <span className="tb-text">
                    <LabelValue text={line} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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

      {/* FAQ는 화면에 반드시 보여야 한다 — 구글은 페이지에 없는 Q&A를 스키마로만
          넣는 것을 정책 위반으로 본다. 위 본문에 흩어져 있는 사실을 질문 형태로
          다시 모아, 음성검색·AI 답변이 그대로 인용할 수 있는 형태로 제공한다. */}
      {faqs.length > 0 && (
        <section className="section" aria-labelledby="faq">
          <h2 id="faq">자주 묻는 질문</h2>
          <dl className="faq-list">
            {faqs.map((item) => (
              <div className="faq-item" key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
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
 * 주차 카드 제목 통일(2026-08-05). CGV는 원문 "■" 제목을 그대로 쓰다 보니
 * "주차 요금"·"주차요금"·"주차 확인(인증방법)"·"주차 확인(정산방법)" 등 지점마다
 * 77종류로 갈라져 있었다. 제목 문구가 아니라 의미(안내/확인/요금)로 다시
 * 묶어 "주차 안내"·"주차 확인"·"주차 요금" 세 제목으로 고정하고, 롯데·메가박스의
 * guide/howTo/fee 필드도 같은 세 제목으로 맞춘다 — 3사 전부 같은 카드 제목·
 * 순서(안내→확인→요금)로 통일하는 게 목적.
 */
function classifyParkingTitle(title: string): '주차 안내' | '주차 확인' | '주차 요금' {
  if (/요금|비용/.test(title)) return '주차 요금';
  if (/확인|인증|정산|등록/.test(title)) return '주차 확인';
  return '주차 안내';
}

function buildParkingSections(b: Branch): { title: string; body: string }[] {
  const raw: { title: string; body: string }[] = b.parking.raw
    ? // "■"로 쪼개면 첫 "■" 이전 내용은 title이 원문 첫 줄이 되는데, 일부
      // 지점(구미·인천계양 등)은 그 줄이 "●"·"'" 같은 기호 하나뿐이라 카드
      // 제목이 의미 없는 글자로 나온다 — 한글·영문·숫자가 하나도 없으면 실제
      // 안내문 제목으로 바꿔준다.
      splitByMarker(b.parking.raw, '■')
        .map((s) => ({
          ...s,
          title: /^[^가-힣a-zA-Z0-9]*$/.test(s.title) ? '주차 안내' : s.title,
        }))
        // "'■ 주차 안내" 처럼 첫 "■" 앞에 기호 한 글자만 있으면 본문 없는
        // 빈 카드가 생긴다 — 걸러낸다.
        .filter((s) => s.body)
        // 원문 크롤링 경계 오류로 "■ 지하철" 같은 지하철 안내가 주차 필드에
        // 통째로 섞여 들어온 지점(대전탄방 등)이 있다 — 주차 카드로는 안
        // 보여주고, extractStrayParkingSubway()가 따로 지하철 카드로 옮긴다.
        .filter((s) => s.title.trim() !== '지하철')
    : [
        b.parking.guide && { title: '주차 안내', body: b.parking.guide },
        b.parking.howTo && { title: '주차 확인', body: b.parking.howTo },
        b.parking.fee && { title: '주차 요금', body: b.parking.fee },
      ].filter((x): x is { title: string; body: string } => Boolean(x));

  const order: ('주차 안내' | '주차 확인' | '주차 요금')[] = ['주차 안내', '주차 확인', '주차 요금'];
  const grouped = new Map<string, string[]>();
  for (const s of raw) {
    const canon = classifyParkingTitle(s.title);
    if (!grouped.has(canon)) grouped.set(canon, []);
    grouped.get(canon)!.push(s.body);
  }
  return order
    .filter((title) => grouped.has(title))
    .map((title) => ({ title, body: grouped.get(title)!.join('\n\n') }));
}

/** 원문 크롤링 경계 오류로 지하철 안내가 parking.raw 안에 "■ 지하철" 조각으로
 * 섞여 들어온 지점(대전탄방 등)의 지하철 정보를 되찾아온다. 이런 지점은
 * transit.subway/raw가 아예 비어 있어서(그 정보의 유일한 출처가 parking.raw
 * 였음) buildParkingSections()에서 그냥 걸러내기만 하면 정보 자체가 통째로
 * 사라진다 — 주차 카드로는 안 보여주되 지하철 카드로 옮겨 보여준다. */
function extractStrayParkingSubway(b: Branch): string | undefined {
  if (!b.parking.raw) return undefined;
  return splitByMarker(b.parking.raw, '■').find((s) => s.title.trim() === '지하철')?.body;
}

/**
 * "[버스]" / "(지하철)"처럼 대괄호·소괄호 안에 제목만 있는 한 줄짜리 헤더로
 * 원문을 구간별로 쪼갠다. CGV 일부 지점(예: 백석)은 "#"·"■" 마커 대신 이
 * 형태를 쓴다 — 못 쪼개면 지하철·버스 구분 없이 원문 전체가 "교통 안내"
 * 카드 하나로 뭉뚱그려져 아이콘·칩 없이 밋밋하게 나온다.
 */
function splitByHeaderLine(raw: string): { title: string; body: string }[] {
  const lines = raw.split('\n');
  const chunks: { title: string; body: string[] }[] = [];
  for (const line of lines) {
    const m = line.trim().match(/^[[(]([^\])]+)[\])]$/);
    if (m) {
      chunks.push({ title: m[1].trim(), body: [] });
    } else if (chunks.length > 0) {
      chunks[chunks.length - 1].body.push(line);
    } else {
      chunks.push({ title: '', body: [line] });
    }
  }
  return chunks
    .map((c) => ({ title: c.title, body: c.body.join('\n').trim() }))
    .filter((c) => c.body);
}

/** 원문 안에서 "직행)"·"마을)"처럼 여는 괄호 없이 유형명 뒤에 ")"만 붙는 표기를 통일한다. */
const BUS_TYPE_WORDS = ['직행', '일반', '마을', '간선', '좌석', '광역', '급행', '순환', '심야', '공항', '지선'];
/** "일반 5-3, 6-2, ..."처럼 콜론 없이 유형명 뒤에 바로 값이 오는 줄에서 라벨을 떼어낸다. */
const BUS_WORD_LEAD_RE = new RegExp(`^(${BUS_TYPE_WORDS.join('|')})\\s+(.+)$`);

/**
 * 원문을 읽기 쉬운 불릿 목록으로 바꾼다. 브랜드마다 원본 형식이 달라
 * 두 갈래로 처리한다:
 *
 * - CGV 스타일(원문에 "- "로 시작하는 줄이 있음): "-" 줄이 새 항목,
 *   나머지 줄(":" 시작 등)은 앞 항목의 부연설명으로 붙인다.
 * - 롯데·메가박스 스타일("-"가 아예 없고 줄바꿈으로만 구분): 각 줄이
 *   독립 항목이다. 예전엔 이 경우도 CGV 규칙을 태워서 첫 줄만 남고
 *   나머지가 전부 한 덩어리로 뭉쳐 읽기 어려웠다(전체 필드의 절반 이상).
 *
 * 추가로 "(1)...(2)...(3)..." 처럼 번호만 붙고 줄바꿈이 없는 원문은
 * 번호 앞에서 끊어 각각을 별도 줄로 만든다.
 */
function toBullets(raw: string): { text: string; note?: string }[] {
  // 여는 괄호 "(" 바로 뒤가 아닐 때만 매칭한다 — "1000(급행)"처럼 정상적인
  // 괄호 설명 안의 "급행"까지 "급행)" 마커로 오인해 잘라먹으면 안 된다
  // (부산장림 롯데: "1000(급행)"의 ")"가 사라지고 "급행버스 :"가 중간에
  // 끼어들어 뒤 내용이 전부 뭉개졌었다).
  const busTypeRe = new RegExp(`(?<!\\()(${BUS_TYPE_WORDS.join('|')})\\)\\s*`, 'g');
  const normalized = raw
    // "●"·"○"·"★"·"■"·"ㆍ"는 CGV·롯데 일부 지점(백석·구미·부천·장림 등)이 쓰는
    // 불릿 기호다 — "-"와 똑같이 새 항목 표시로 취급해야 문단 하나로 뭉개지지
    // 않는다. ("■"는 extractTransit 단계에서 구간(지하철/버스) 마커로도 쓰이지만,
    // 여기 toBullets는 그 구간이 이미 쪼개진 뒤의 본문에서 호출되므로 항목
    // 불릿으로만 다뤄도 안전하다.)
    .replace(/^[ \t]*[●•○★■ㆍ]\s*/gm, '- ')
    // "1. 지하주차장"·"2. 지상주차장"처럼 "숫자. 한글라벨"만 있는 줄(강변 CGV
    // 등)은 숫자가 그대로 텍스트에 남으면 어색하니 "[라벨]" 형태로 바꿔
    // LabelValue의 대괄호 라벨 처리(볼드 소제목)를 그대로 타게 한다. 줄
    // 전체가 짧은 한글 라벨일 때만 대상으로 삼는다 — "3. 4. 6(6-1), 11, ..."
    // 처럼 마침표를 노선 구분자로 쓰는 줄(인천터미널 롯데 등)은 라벨 뒤에
    // 숫자·쉼표가 더 이어지므로(줄 전체가 아니므로) 매칭되지 않는다.
    .replace(/^(\d{1,2})\.\s*([가-힣][가-힣a-zA-Z0-9()~·\s]{0,18})$/gm, '[$2]')
    // "[일반] 10, 83 / [간선] 160, 503 / [지선] 5615, ..."처럼 "[유형] 값" 여러
    // 묶음이 "/"로 한 줄에 이어 붙은 표기(신도림 롯데 등)를 각각 별도 줄로
    // 나눈다 — 안 나누면 뒤 묶음들이 앞 라벨의 값에 통째로 섞여 칩이 안 된다.
    // (노선번호 안에 쓰이는 "5-3 / 6-2" 같은 "/"는 뒤에 "["가 없으니 안전하다.)
    .replace(/\s*\/\s*(?=\[)/g, '\n')
    // "직행)"·"마을)"·"심야)"처럼 여는 괄호 없이 유형명 뒤에 ")"만 붙는 표기를
    // 다른 항목들과 같은 "직행버스 : 값" 형식으로 통일한다.
    .replace(busTypeRe, (_m, word: string) => `\n${word}버스 : `)
    // "(1)" 같은 순번 앞에서 줄을 나눈다. "(총 1,058대)"·"(2층)"처럼 숫자
    // 뒤에 글자가 오는 괄호는 대상이 아니라 안전하다.
    .replace(/\((\d+)\)\s*/g, '\n($1) ');
  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const usesDash = lines.some((l) => l.startsWith('-'));
  if (!usesDash) {
    return lines.map((line) => ({ text: line.replace(/^:\s*/, '') }));
  }

  const bullets: string[][] = [];
  for (const line of lines) {
    // "[지하주차장]"처럼 라벨만 있는 줄(위 "N. 라벨" 변환 결과)은 이전
    // 항목의 부연설명이 아니라 그 자체로 새 항목(소제목)이어야 한다 — 안
    // 그러면 대시 목록 중간에서 직전 항목의 note로 묻혀버린다.
    if (line.startsWith('-') || /^\[[^\]]+\]$/.test(line)) {
      bullets.push([line.replace(/^-\s*/, '')]);
    } else if (bullets.length > 0) {
      bullets[bullets.length - 1].push(line.replace(/^:\s*/, ''));
    } else {
      bullets.push([line]);
    }
  }
  return bullets.map(([text, ...rest]) => ({ text, note: rest.join(' ') || undefined }));
}

/**
 * "라벨 : 값" 또는 "[제목] 내용" 형태의 줄에서 라벨·제목만 굵게 보여준다.
 * 경로 안내의 ">"는 화살표로 바꿔 단계 구분이 눈에 들어오게 한다.
 */
function LabelValue({ text }: { text: string }) {
  // "->"와 ">" 둘 다 경로 화살표로 쓰인다. "-"를 남기면 "- →"처럼 어색해진다.
  const pretty = text.replace(/\s*-?>\s*/g, ' → ');

  const bracket = pretty.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  if (bracket) {
    return (
      <>
        <strong>{bracket[1].trim()}</strong>
        {bracket[2] ? ` ${bracket[2].trim()}` : ''}
      </>
    );
  }

  // 문장 중간에 우연히 있는 콜론까지 라벨로 잡으면 앞부분이 통째로 굵어진다.
  // 라벨로 볼 만한 길이일 때만 나눈다 — 롯데 버스 안내의 정류장명이
  // "건대입구역 사거리.건대병원(정류장번호 05232)_어린이대공원역,화양천주교교회 방면"
  // 처럼 47자까지 가서 넉넉히 잡았다.
  const idx = pretty.indexOf(':');
  if (idx === -1 || idx > 55) return <>{pretty}</>;
  return (
    <>
      <strong>{pretty.slice(0, idx).trim()}</strong>
      {' : '}
      {pretty.slice(idx + 1).trim()}
    </>
  );
}

/** "라벨 : 값" / "[라벨] 값"을 라벨과 값으로 나눈다. 라벨이 없으면 value만 채운다. */
function splitLabel(text: string): { label?: string; value: string } {
  const bracket = text.match(/^\[([^\]]+)\]\s*:?\s*([\s\S]*)$/);
  if (bracket) return { label: bracket[1].trim(), value: bracket[2].trim() };
  const idx = text.indexOf(':');
  // 문장 중간의 콜론까지 라벨로 잡지 않도록 길이를 제한한다(롯데 정류장명 최대 47자).
  if (idx !== -1 && idx <= 55) {
    return { label: text.slice(0, idx).trim(), value: text.slice(idx + 1).trim() };
  }
  return { value: text };
}

/** "직행"·"마을"처럼 유형명만 있는 라벨은 "직행버스"·"마을버스"로 통일한다. */
function normalizeBusLabel(label: string): string {
  return BUS_TYPE_WORDS.includes(label) ? `${label}버스` : label;
}

/**
 * "104번, 106번, 316번"처럼 노선번호만 쉼표로 나열된 값을 칩 배열로 만든다.
 * "801"처럼 한 줄에 하나만 있어도 칩으로 만든다 — 세종(조치원) 메가박스의
 * 마지막 줄이 그래서 혼자 칩이 안 되고 맨텍스트로 남았었다.
 *
 * 조각이 전부 "짧고(8자 이하) 공백 없고 숫자를 포함"할 때만 칩으로 본다.
 * - 공백 검사: 메가박스 "6630,6632,6645,6648 N65 발산역 9번 출구"처럼 번호
 *   뒤에 설명이 붙은 경우 "9번"까지 노선으로 오인하는 걸 막는다.
 * - 숫자 검사: "무료"·"없음" 같은 짧은 한글 단어가 칩이 되는 걸 막는다.
 *   노선번호는 11·801·B5·급행3·서초03·M4403처럼 반드시 숫자를 포함한다.
 */
function parseRoutes(value: string): string[] | null {
  // 쉼표가 기본이지만 일부 지점(소풍 CGV 등)은 "/"로, 일부(인천터미널 롯데 등)는
  // "3. 4. 6(6-1), 11, ..."처럼 앞쪽만 마침표+공백으로 노선을 나열한다.
  const parts = value.split(/[,/]|\.\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  // "장유(58번, 59번), 장유(98번, ...)"처럼 정류장별로 괄호 안에 여러 노선이
  // 묶인 값을 쉼표로 나누면 "장유(58번"·"59번)"처럼 괄호가 반쪽만 남은 조각이
  // 생긴다. 그대로 두면 "장유(58"같은 깨진 칩이 나온다(김해 CGV) — 괄호가
  // 안 맞는 조각이 하나라도 있으면 이 줄 전체는 칩화를 포기하고 텍스트로 둔다.
  const balanced = (p: string) => (p.match(/\(/g) ?? []).length === (p.match(/\)/g) ?? []).length;
  // "2,000여대"·"1,058대"처럼 천단위 콤마가 들어간 숫자(주차 대수 등)가
  // "2"·"000여대" 두 조각으로 쪼개져 노선번호처럼 칩화되던 버그(강변 CGV
  // 주차 안내 등) — "대"·"명"·"석"·"원" 같은 수량 단위로 끝나는 조각이
  // 하나라도 있으면 노선 목록이 아니라고 보고 통째로 포기한다.
  if (!parts.every((p) => p.length <= 8 && !/\s/.test(p) && /\d/.test(p) && balanced(p) && !NOT_ROUTE_SUFFIX_RE.test(p)))
    return null;
  return parts.map((p) => p.replace(/번$/, ''));
}

/**
 * "H19번 (약 50분소요)"처럼 노선 목록 맨 끝에 붙는 괄호 설명을 떼어낸다.
 * 남겨두면 그 조각만 공백을 포함해 parseRoutes 전체가 실패하고(동탄호수공원
 * "병점역" 줄이 그래서 칩이 안 되고 통짜 텍스트로 남았다) 나머지 노선번호까지
 * 칩이 안 됐다.
 */
function stripTrailingParen(value: string): { value: string; note?: string } {
  const m = value.match(/^([\s\S]*?)\s*(\([^()]*\))\s*$/);
  if (!m) return { value };
  return { value: m[1].replace(/,\s*$/, '').trim(), note: m[2] };
}

/**
 * "A > B > C" 형태의 길찾기 경로를 단계 배열로 나눈다.
 * 원문이 ">"를 쓰는 지점(80곳)과 화살표 문자 "→"를 쓰는 지점(81곳)이
 * 비슷하게 섞여 있어 둘 다 구분자로 받는다.
 */
function parseSteps(value: string): string[] | null {
  if (!/-?>|→/.test(value)) return null;
  const steps = value.split(/\s*(?:-?>|→)\s*/).map((s) => s.trim()).filter(Boolean);
  return steps.length >= 2 ? steps : null;
}

type TransitItem = {
  label?: string;
  routes?: string[];
  steps?: string[];
  body?: string;
  note?: string;
};

/**
 * 교통·주차 안내 한 덩어리를 화면에 그리기 좋은 구조로 바꾼다.
 * 노선번호는 칩으로, "A > B > C" 경로는 번호 단계로 분리한다.
 * 롯데 버스 안내는 "[방면]: 노선" 줄과 "정류장 하차 > ..." 줄이 한 세트라
 * 뒤따르는 경로 줄을 앞 항목에 붙여 하나로 묶는다.
 */
function toTransitItems(text: string): TransitItem[] {
  const items: TransitItem[] = [];
  for (const bullet of toBullets(text)) {
    const split = splitLabel(bullet.text);
    let rawLabel = split.label;
    let value = split.value;

    // "13번, 100-2번 : 메가박스 (하차 도보 1분 내)"처럼 콜론 앞이 노선번호
    // 목록이고 뒤가 목적지·정류장 설명인, 순서가 반대인 지점(원주혁신
    // 메가박스, 대전가오·Drive In 영도 CGV, 대전현대프리미엄아울렛 메가박스
    // 등)이 있다. splitLabel은 "라벨 : 값"만 가정해 이 경우 노선번호를
    // 볼드 라벨로, 목적지를 본문으로 잘못 보여준다 — 콜론 앞이 전부
    // 노선처럼 생겼으면(looksLikeRouteWord) 뒤집어서 노선은 칩으로, 목적지는
    // 부연설명(note)으로 보여준다.
    if (rawLabel) {
      const labelParts = rawLabel.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
      if (labelParts.length > 0 && labelParts.every((p) => looksLikeRouteWord(p))) {
        const reversedRoutes = parseRoutes(rawLabel);
        if (reversedRoutes) {
          items.push({ routes: reversedRoutes, note: value || undefined });
          continue;
        }
      }
    }
    // "일반 5-3, 6-2, ..."처럼 콜론 없이 유형명 뒤에 바로 값이 오는 경우(부천 CGV
    // 등)도 라벨로 떼어낸다. splitLabel은 ":"/"[]" 형식만 인식한다.
    if (!rawLabel) {
      const busWordMatch = value.match(BUS_WORD_LEAD_RE);
      if (busWordMatch) {
        rawLabel = busWordMatch[1];
        value = busWordMatch[2];
      }
    }
    const label = rawLabel ? normalizeBusLabel(rawLabel) : rawLabel;

    // 노선 목록 끝에 붙는 "(약 50분소요)" 같은 괄호 설명은 떼어내고 노선번호만
    // 칩으로 파싱한 뒤 note로 붙인다 — 안 떼면 그 조각 하나 때문에 전체가
    // 칩이 안 되고 통짜 텍스트로 남는다(동탄호수공원 CGV "병점역" 줄).
    const { value: valueNoNote, note: trailingNote } = stripTrailingParen(value);
    let routes = parseRoutes(valueNoNote);
    if (routes && trailingNote) {
      bullet.note = [bullet.note, trailingNote].filter(Boolean).join(' ');
    } else if (!routes) {
      routes = parseRoutes(value);
    }
    let steps = routes ? null : parseSteps(value);

    // "2113, 2114 이용 시 묵동명사약국역 정류장에서 하차"(중랑 롯데 등)처럼 노선
    // 번호 뒤에 안내 문장이 바로 붙어서 parseRoutes가 통째로 실패하던 줄도,
    // 앞쪽 번호 목록만 떼어내면 칩으로 보여줄 수 있다.
    let leadNote: string | undefined;
    if (!label && !routes && !steps) {
      const lead = value.match(/^([A-Za-z0-9](?:[A-Za-z0-9,\-\s]*[A-Za-z0-9]))\s+([가-힣].*)$/);
      if (lead) {
        const leadRoutes = parseRoutes(lead[1]);
        if (leadRoutes) {
          routes = leadRoutes;
          leadNote = lead[2];
        }
      }
    }

    const prev = items[items.length - 1];
    if (!label && steps && prev && prev.routes && !prev.steps) {
      prev.steps = steps;
      if (bullet.note) prev.note = [prev.note, bullet.note].filter(Boolean).join(' ');
      continue;
    }

    // 라벨 없이 노선번호만 있는 줄이 연달아 오면 하나로 합친다. 세종(조치원)
    // 메가박스처럼 원문이 노선 계열별로 줄을 나눠놨는데 그룹명이 없는 경우,
    // 줄마다 쪼개 봐야 근거 없는 구분만 남고 칩이 흩어져 읽기 나쁘다. 위에서
    // 안내 문장을 떼어낸 줄(leadNote 있음)은 각자 설명이 달라 합치지 않는다.
    if (!label && routes && !bullet.note && !leadNote && prev && !prev.label && prev.routes && !prev.steps && !prev.body && !prev.note) {
      prev.routes = [...prev.routes, ...routes];
      continue;
    }

    items.push({
      label,
      routes: routes ?? undefined,
      steps: steps ?? undefined,
      body: routes || steps ? undefined : value,
      note: [bullet.note, leadNote].filter(Boolean).join(' ') || undefined,
    });
  }
  return items;
}

/**
 * "지하철 : 1호선 의정부역 6번출구" 처럼 구간 마커("#"·"■"·"[]") 없이 항목별로
 * "지하철"/"버스" 라벨이 붙어 한 덩어리로 온 원문(의정부 CGV 등)을, 그 라벨을
 * 기준으로 지하철/버스 두 그룹으로 나눈다. 마커 기반 추출이 다 실패했을 때만 쓴다.
 */
function splitTransitItemsByLabel(raw: string): { subwayItems: TransitItem[]; busItems: TransitItem[] } | null {
  const items = toTransitItems(raw);
  const subwayItems = items.filter((it) => it.label?.includes('지하철'));
  if (subwayItems.length === 0) return null;
  const busItems = items.filter((it) => !subwayItems.includes(it));
  return { subwayItems, busItems };
}

function TransitItemsList({ items }: { items: TransitItem[] }) {
  return (
    <ul className="transit-bullets">
      {items.map((item, i) => {
        // 칩·번호단계만 있는 항목은 불릿 점이 의미 없이 지저분하기만 하다
        // (김포공항 롯데의 번호 단계 목록 위에 뜬금없는 점이 떠 있던 문제).
        const chipsOnly = !item.label && !item.body && !item.note && Boolean(item.routes || item.steps);
        return (
        <li key={i} className={chipsOnly ? 'chips-only' : undefined}>
          {item.label && <span className="tb-label">{item.label}</span>}
          {item.routes && (
            <span className="tb-routes">
              {item.routes.map((r, j) => (
                <span className="tb-route" key={`${r}-${j}`}>
                  {r}
                </span>
              ))}
            </span>
          )}
          {item.body && (
            <span className="tb-text">
              <LabelValue text={item.body} />
            </span>
          )}
          {item.steps && (
            // 예전엔 ①②③ 번호 목록으로 보여줬는데, 짧은 길찾기 단계에 굳이
            // 번호를 매기니 어색하다는 피드백(롯데 청주용암 등)으로 화살표
            // 한 줄로 통일했다. 버스·지하철·주차 안내가 전부 이 컴포넌트를
            // 같이 쓰므로 여기 한 곳만 고치면 전체에 적용된다.
            <span className="tb-text tb-steps-inline">{item.steps.join(' → ')}</span>
          )}
          {item.note && (
            <span className="tb-note">
              <LabelValue text={item.note} />
            </span>
          )}
        </li>
        );
      })}
    </ul>
  );
}

function BulletList({ text }: { text: string }) {
  return <TransitItemsList items={toTransitItems(text)} />;
}

/**
 * 서울 CGV 버스 안내 전용 카테고리 칩 추출기(2026-08-05 통일 작업).
 * 기존 toTransitItems는 원문 구조(마커·정류장 반복 등)를 그대로 따라가다 보니
 * 지점마다 결과 모양이 달랐다(정류장별 텍스트 vs 칩). 이 함수는 원문 전체에서
 * "간선/지선/광역/..." 같은 카테고리 단어를 직접 찾아 값을 모으는 방식이라
 * 원문 구조(마커 유무, 콜론/대시, 정류장 반복)에 관계없이 같은 모양(카테고리별
 * 칩 그룹)으로 통일된다. 원본에 카테고리 단어가 아예 없는 지점(왕십리 등)은
 * null을 반환해 기존 렌더링으로 폴백한다.
 */
const BUS_CATEGORY_WORDS = ['간선', '지선', '급행', '좌석', '광역', '마을', '일반', '공항', '순환', '심야', '도시형', '직행'];
const BUS_CATEGORY_RE = new RegExp(
  `(?<![가-힣])(${BUS_CATEGORY_WORDS.join('|')})(?:\\s?버스)?(\\s*\\([^()]{1,12}\\))?(?:\\])?(?:\\))?` +
    // "급행버스 이용 시: 1, 2..."(대구한일 등)처럼 카테고리와 구분자 사이에
    // "이용 시" 같은 군더더기 문구가 끼는 지점도 있어 선택적으로 건너뛴다.
    `(?:\\s*이용\\s*시)?` +
    // 롯데·메가박스로 넓히며(2026-08-05 3차) "이음1(심야):횡단보도 총 2회
    // 이용..."처럼 콜론 뒤가 노선번호가 아니라 그냥 안내 문장인 지점이
    // 나왔다. 콜론 뒤 한글은 "은평02"처럼 한글 1~3자 + 숫자가 바로 붙는
    // 노선명 모양일 때만 허용하고, 일반 문장은 걸러낸다.
    `(?:\\s*[:：\\-]\\s*(?=[0-9A-Za-z]|[가-힣]{1,3}\\d)|\\s+(?=[0-9A-Za-z]))`,
  'g'
);
/** 전국 CGV·롯데·메가박스로 넓히면서(2026-08-05) "광역- 5005 기흥역 하차 후
 * ... 도보 13분"처럼 노선번호 뒤에 설명 문장이 콤마 없이 바로 붙는 지점이
 * 나타났다. "13분"·"도보5분"·"한성1차아파트"처럼 숫자가 섞였다는 이유만으로
 * 토큰 필터를 통과해 노선 칩으로 잘못 섞여 들어가던 걸, 이런 단위·조사로
 * 끝나는 토큰은 노선번호가 아니라고 보고 제외한다. "은평02"·"달서4-1"처럼
 * 한글이 접두어로만 오는 진짜 노선명은 이 접미어들로 끝나지 않아 영향 없다. */
const NOT_ROUTE_SUFFIX_RE =
  /(분|초|미터|층|아파트|사거리|입구|정류장|출구|방향|쪽|거리|이내|이상|하차|도보|개|호기|회|대|명|석|원)$|^\d+[mM]$/;
/** 단어(콤마·공백으로 나눈 한 조각) 하나가 "노선번호처럼 생겼는지" 판단한다.
 * 영문/숫자(대시 포함, 예: 21-B·5002B)거나, "은평02"·"강서04"처럼 한글
 * 1~3자 접두어 + 숫자로 시작하는 모양이면 노선으로 본다. "기흥역"·"압구정역"
 * 처럼 숫자 없는 순수 한글 단어, "(정류장" 같은 괄호 낀 단어는 걸러진다. */
function looksLikeRouteWord(w: string): boolean {
  const s = w.replace(/[.:：]$/, '').replace(/번$/, '');
  if (/^[0-9A-Za-z](?:[0-9A-Za-z-]*[0-9A-Za-z])?$/.test(s)) return true;
  if (/^[가-힣]{1,3}\d[0-9A-Za-z-]*$/.test(s)) return true;
  return false;
}

function extractCategorizedBusRoutes(raw: string | null | undefined): { label: string; routes: string[] }[] | null {
  if (!raw) return null;
  const matches = [...raw.matchAll(BUS_CATEGORY_RE)];
  if (matches.length === 0) return null;
  const result = new Map<string, Set<string>>();
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const word = m[1];
    const color = m[2] ? m[2].trim() : '';
    const label = `${word}버스${color}`;
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
    const lines = raw.slice(start, end).split('\n');
    // 노선목록 뒤에 정류장 설명·안내문이 콤마 없이 바로 붙는 경우(경기 CGV
    // 다수, 고양스타필드 메가박스 등)와, 줄바꿈으로 다음 정류장 설명이 이어
    // 지는 경우(압구정 CGV 등) 둘 다 같은 규칙으로 자른다: 단어(콤마·공백
    // 구분) 단위로 "노선처럼 생겼는지" 보고, 아닌 단어를 만나면 그 줄에서
    // 멈추고 이어지는 줄도 더 이상 보지 않는다.
    const keptLines: string[] = [];
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li].trim();
      if (li > 0 && !line) break;
      const words = line.split(/[,\s/]+/).filter(Boolean);
      const keptWords: string[] = [];
      for (const w of words) {
        if (!looksLikeRouteWord(w)) break;
        keptWords.push(w);
      }
      if (keptWords.length > 0) keptLines.push(keptWords.join(' '));
      if (keptWords.length < words.length) break; // 이 줄에서 설명문을 만났으니 더 안 본다
    }
    const tokens = keptLines
      .join(' ')
      .split(/[,\s/]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      // "103."(마침표로 노선을 나열하는 지점, 인천터미널 롯데) · "6:"(콜론이
      // 바로 뒤에 붙는 지점, 대구이시아 메가박스) 등 꼬리 구두점을 뗀다.
      .map((t) => t.replace(/[.:：]$/, ''))
      .filter((t) => /\d/.test(t) && t.length <= 8 && !/[()]/.test(t) && !NOT_ROUTE_SUFFIX_RE.test(t))
      .map((t) => t.replace(/번$/, ''));
    if (tokens.length === 0) continue;
    if (!result.has(label)) result.set(label, new Set());
    for (const t of tokens) result.get(label)!.add(t);
  }
  if (result.size === 0) return null;
  return [...result.entries()].map(([label, set]) => ({ label, routes: [...set] }));
}

/**
 * "514번/618번: 은어송 5단지 하차, 도보로 1분 소요"처럼 카테고리 단어 없이
 * "노선목록 : 목적지" 줄이 여러 개 반복되는 지점(대전가오·Drive In 영도 CGV,
 * 원주혁신·대전현대프리미엄아울렛 메가박스 등)용 추출기. 콜론 앞이 전부
 * 노선처럼 생긴 줄만 뽑으므로(looksLikeRouteWord) "감삼네거리1 : ..."같은
 * 정류장명은 안 걸린다(한글이 3자를 넘어가면 노선 모양이 아니라고 봄).
 * extractUngroupedBusRoutes는 노선이 연달아 2개 이상 붙어 있어야만 잡는데,
 * 이 패턴은 줄마다 노선이 1개뿐인 경우(511번: ... 처럼)가 많아 그 규칙으로는
 * 아예 못 잡고 정보가 통째로 사라진다 — 그래서 콜론 구조를 직접 본다.
 */
function extractReversedRouteLines(raw: string): TransitItem[] | null {
  const items: TransitItem[] = [];
  for (const rawLine of raw.split('\n')) {
    // "- 8, 66, ... : 태종대 종점"(Drive In 영도 CGV 등) 처럼 대시로 시작하는
    // 줄은 대시를 떼야 콜론 앞이 순수 노선목록으로 보인다.
    const line = rawLine.trim().replace(/^[-●•○★■ㆍ]\s*/, '');
    const colonIdx = line.includes(':') ? line.indexOf(':') : line.indexOf('：');
    if (colonIdx === -1 || colonIdx > 30) continue;
    const beforeColon = line
      .slice(0, colonIdx)
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (beforeColon.length === 0 || !beforeColon.every((p) => looksLikeRouteWord(p))) continue;
    const routes = parseRoutes(line.slice(0, colonIdx));
    if (!routes) continue;
    const note = line.slice(colonIdx + 1).trim();
    items.push({ routes, note: note || undefined });
  }
  return items.length > 0 ? items : null;
}

/** 카테고리 단어가 아예 없는 지점(고덕강일·수유 등)용 보조 추출기. 숫자 섞인
 * 짧은 토큰이 2개 이상 연달아 나오는 구간을 노선번호 목록으로 본다. 그런
 * 구간이 여러 곳이면(어디가 노선번호 목록인지 애매하면) null을 반환해 억지로
 * 만들지 않는다. 카테고리 단어 없이는 문맥을 알 수 없어 원문에 "버스"라는
 * 말 자체가 없으면 시도하지 않는다 — 안 그러면 "E/V 1,2호기"처럼 버스와
 * 무관한 숫자 나열(엘리베이터 안내 등, 롯데 진주혁신 등)까지 노선번호로
 * 잘못 뽑힌다. */
function extractUngroupedBusRoutes(raw: string | null | undefined): string[] | null {
  if (!raw || !raw.includes('버스')) return null;
  const words = raw.replace(/[,/]/g, ' ').split(/\s+/).filter(Boolean);
  // looksLikeRouteWord 혼자만 쓰면 "GATE"처럼 숫자 없는 순수 알파벳 단어도
  // 통과한다(순수 alnum 패턴엔 숫자 필수 조건이 없음) — 노선번호는 항상
  // 숫자를 포함하므로 /\d/ 검사를 별도로 더한다.
  const isRouteToken = (w: string) => w.length <= 8 && /\d/.test(w) && looksLikeRouteWord(w) && !NOT_ROUTE_SUFFIX_RE.test(w);
  const runs: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    if (isRouteToken(w)) {
      cur.push(w.replace(/[.:：]$/, '')); // "380."·"618번:" 등 꼬리 구두점 제거
    } else {
      if (cur.length >= 2) runs.push(cur);
      cur = [];
    }
  }
  if (cur.length >= 2) runs.push(cur);
  if (runs.length !== 1) return null;
  return runs[0].map((t) => t.replace(/번$/, ''));
}

/** cgvBusChips가 원문에서 버스 카테고리 줄을 뽑아간 뒤, 남은 줄(지하철
 * 안내 등)만 골라 지하철 카드용 텍스트로 돌려준다. subway/itemSplit이 이미
 * 지하철을 따로 뽑아둔 지점(강남 등, "#"/"■" 마커 있음)에서는 안 쓰인다 —
 * 마커가 없어 지하철·버스가 원문 한 덩어리로 뭉쳐 있던 지점(대학로·방학 등)
 * 전용 보조 함수. 안 그러면 버스 칩과 "교통 안내" 원문 카드에 같은 버스
 * 내용이 중복으로 뜬다. */
function stripToSubwayOnlyText(raw: string): string {
  const catLineRe = new RegExp(`(?<![가-힣])(${BUS_CATEGORY_WORDS.join('|')})(?:\\s?버스)?`);
  const headerOnlyRe = /^(?:\d\)\s*|[0-9]\.\s*)?(버스|지하철)\s*(안내|이용\s*시)?\s*[:：]?$/;
  return raw
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (headerOnlyRe.test(t)) return false;
      if (catLineRe.test(t) && /\d/.test(t)) return false;
      if (/^[0-9A-Za-z][0-9A-Za-z,\-\s]*$/.test(t) && /\d/.test(t)) return false;
      // "514번/618번: 은어송 5단지 하차, 도보로 1분 소요"처럼 콜론 앞이
      // 노선번호 목록인 반대 순서 줄(대전가오 CGV 등)도 버스 내용이니
      // 걸러낸다 — toTransitItems의 반대 순서 처리와 같은 판단 기준
      // (looksLikeRouteWord)을 쓴다.
      const colonIdx = t.indexOf(':') !== -1 ? t.indexOf(':') : t.indexOf('：');
      if (colonIdx !== -1 && colonIdx <= 30) {
        const beforeColon = t.slice(0, colonIdx).split(/[,/]/).map((s) => s.trim()).filter(Boolean);
        if (beforeColon.length > 0 && beforeColon.every((p) => looksLikeRouteWord(p))) return false;
      }
      // 카테고리 단어 없이 "버스 100,107,..." 처럼 노선번호가 문장 중간에
      // 나열된 줄(수유 등)도 걸러낸다 — 안 그러면 이 줄이 지하철 카드에
      // 그대로 남고 같은 번호가 버스 칩 카드에도 또 떠서 중복된다. 숫자 섞인
      // 짧은 토큰이 3개 연속 나올 때만 "노선번호 나열"로 보고, 1~2개는 그냥
      // 문장 속 숫자(출구 번호 등)일 수 있어 건드리지 않는다.
      const words = t.replace(/[,/]/g, ' ').split(/\s+/);
      let run = 0;
      for (const w of words) {
        if (/^[0-9A-Za-z가-힣-]{1,8}$/.test(w) && /\d/.test(w) && !NOT_ROUTE_SUFFIX_RE.test(w)) {
          run++;
          if (run >= 3) return false;
        } else run = 0;
      }
      return true;
    })
    .join('\n')
    .trim();
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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="4" y="3" width="16" height="14" rx="4" />
    <path d="M4 11h16M8 17l-2 4M16 17l2 4" />
    <circle cx="8.5" cy="14" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="14" r="0.6" fill="currentColor" />
  </svg>
);
const IconBus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M3 11h18M7 16l-1.5 3M17 16l1.5 3" />
    <circle cx="7" cy="13.2" r="0.6" fill="currentColor" />
    <circle cx="17" cy="13.2" r="0.6" fill="currentColor" />
  </svg>
);
const IconParking = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 16V7h3.5a2.5 2.5 0 0 1 0 5H9" />
  </svg>
);
const IconTicket = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M9 6v12" strokeDasharray="2.5 2.5" />
  </svg>
);
const IconCoin = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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
  const info = brandMeta(b.brand);
  const priceGroups = pivotPrices(pricesOf(b.id));

  // CGV는 "# 지하철 ... # 버스 ..." 또는 "■ 지하철 ... ■ 버스 ..." 원문 한 덩어리라
  // 마커로 쪼개고, 롯데·메가박스처럼 이미 나뉜 데이터는 그대로 쓴다. "#"로 먼저
  // 시도하고 지하철·버스 둘 다 못 찾으면 "■"로 다시 시도한다 — 마커 하나만 쓰면
  // 다른 쪽 형식을 쓰는 지점에서 버스 내용이 지하철 카드에 통째로 섞여 들어간다.
  const extractTransit = (raw: string) => {
    // 마커로 실제 쪼개지긴 했는데(chunks.length>=2) 그 어떤 조각도 지하철/
    // 버스가 아닌 방식을 하나라도 발견하면 기억해둔다(Drive In 영도 CGV의
    // "■ 버스 이용 시"/"■ 안내" 등, "안내"는 주행 규칙 같은 무관한 공지) —
    // 원문이 이미 구획돼 있는데 그 안에 "지하철" 조각이 없다면 정말 지하철
    // 정보가 없다는 뜻이니, cgvFallbackSubwayText가 이 무관한 조각을 지하철
    // 카드로 잘못 끌어오지 않게 이 사실을 넘겨준다. 다른 마커로 시도하면
    // 실제로 subway/bus를 찾을 수도 있으니 곧장 반환하지 않고 계속 시도한다.
    let sawStructured = false;
    for (const marker of ['#', '■']) {
      const chunks = splitByMarker(raw, marker);
      // marker가 실제로 원문에 없으면 통짜 한 덩어리(1개)로 돌아온다 — 그 경우
      // 첫 줄에 우연히 "지하철"이 들어있어도 오탐이니(버스 내용까지 한 덩어리에
      // 섞여있음) 마커가 진짜로 쪼갠 경우(2개 이상)만 유효하게 취급한다.
      if (chunks.length < 2) continue;
      sawStructured = true;
      const subway = chunks.find((s) => s.title.includes('지하철'))?.body;
      const bus = chunks.find((s) => s.title.includes('버스'))?.body;
      if (subway || bus) return { subway, bus, structured: true };
    }
    // 일부 CGV 지점(백석 등)은 "#"·"■" 대신 "[버스]"·"(지하철)"처럼 대괄호·
    // 소괄호 한 줄짜리 헤더로 구간을 나눈다.
    const headerChunks = splitByHeaderLine(raw);
    if (headerChunks.length >= 2) {
      sawStructured = true;
      const subway = headerChunks.find((s) => s.title.includes('지하철'))?.body;
      const bus = headerChunks.find((s) => s.title.includes('버스'))?.body;
      if (subway || bus) return { subway, bus, structured: true };
    }
    return { subway: undefined, bus: undefined, structured: sawStructured };
  };
  const extracted = b.transit.raw
    ? extractTransit(b.transit.raw)
    : { subway: undefined, bus: undefined, structured: false };
  const subway = b.transit.subway ?? extracted.subway ?? extractStrayParkingSubway(b);
  const bus = b.transit.bus ?? extracted.bus;
  // 구간 마커("#"·"■"·"[]")가 아예 없이 "지하철 : ...", "지선버스 : ..."처럼
  // 항목별로만 라벨이 붙은 지점(의정부 CGV 등)은 그 라벨 기준으로 다시 나눈다.
  const itemSplit = !subway && !bus && b.transit.raw ? splitTransitItemsByLabel(b.transit.raw) : null;
  // 위 방법들이 다 실패한 지점은 지하철/버스 구분 없이 원문 통째로 카드 하나에
  // 보여준다 — 정보를 조용히 숨기지 않기 위해서다. 원문에 "지하철" 언급이
  // 전혀 없으면(동탄호수공원 CGV의 "버스안내" 등) 사실상 버스 정보뿐이니
  // 카드 제목을 "버스"로, 아니면 애매하니 "교통 안내"로 둔다.
  const transitFallback = !subway && !bus && !itemSplit ? b.transit.raw : null;
  const transitFallbackIsBusOnly = Boolean(transitFallback) && !transitFallback!.includes('지하철');
  // "버스안내"처럼 카드 제목과 똑같은 말만 하는 줄은 군더더기라 걷어낸다.
  const transitFallbackText = transitFallback?.replace(/^\s*(버스|지하철|교통)\s*안내\s*\n/, '') ?? null;

  // 3사 전 지점 버스 칩 통일(2026-08-05, 서울 CGV→전국 CGV→롯데·메가박스로
  // 확대). 원문 구조와 무관하게 카테고리별 칩으로 통일하고, 카테고리 단어가
  // 없으면 라벨 없는 칩 목록으로 폴백한다. 둘 다 실패하면(왕십리처럼 정류장+
  // 코드만 있는 특이 형식) null로 두고 기존 렌더링을 그대로 쓴다. CGV는 버스
  // 텍스트가 raw 한 덩어리에 있고, 롯데·메가박스는 이미 bus 필드로 분리돼
  // 있어(raw는 null) 소스를 raw ?? bus로 통일해서 넘긴다.
  const busSourceText = b.transit.raw ?? b.transit.bus;
  const cgvBusChips: TransitItem[] | null = (() => {
    const categorized = extractCategorizedBusRoutes(busSourceText);
    if (categorized) return categorized.map((c) => ({ label: c.label, routes: c.routes }));
    // "511번: 가오주공아파트 하차, 도보로 5분 소요"처럼 줄마다 노선이 하나뿐인
    // 반대 순서 패턴은 ungrouped(연속 2개 이상 규칙)로는 못 잡으므로 먼저 시도
    const reversed = busSourceText ? extractReversedRouteLines(busSourceText) : null;
    if (reversed) return reversed;
    const ungrouped = extractUngroupedBusRoutes(busSourceText);
    if (ungrouped) return [{ routes: ungrouped }];
    return null;
  })();
  // 마커가 없어 지하철·버스가 원문에 한 덩어리로 뭉쳐 있던 지점(대학로 등)은
  // 버스 칩을 뽑고 나면 나머지(지하철 안내)만 별도 카드로 보여준다. subway나
  // itemSplit이 이미 지하철을 따로 갖고 있으면(롯데·메가박스는 항상 그렇다)
  // 그쪽을 우선하고 이건 안 쓴다. extracted.structured가 true면(마커·헤더로
  // 이미 구획된 원문인데 그중 "지하철" 조각이 없었다는 뜻, Drive In 영도
  // CGV 등) 지하철 정보가 정말 없는 것이니 이 폴백을 시도하지 않는다 — 안
  // 그러면 "버스 이용 시"·"안내"(주행 규칙 등 무관한 공지) 같은 다른 구획
  // 제목·본문이 지하철 카드로 잘못 새어 들어간다.
  const cgvFallbackSubwayText: string | null =
    cgvBusChips &&
    !subway &&
    !(itemSplit && itemSplit.subwayItems.length > 0) &&
    b.transit.raw &&
    !extracted.structured
      ? stripToSubwayOnlyText(b.transit.raw) || null
      : null;

  const parkingSections = buildParkingSections(b);

  const parkingIcon = (title: string) =>
    title.includes('요금') ? <IconCoin /> : title.includes('확인') ? <IconTicket /> : <IconParking />;

  return (
    <>
      <BoxOfficeSection data={boxoffice} />

      {priceGroups.length === 0 && (
        <section className="section" aria-labelledby="prices">
          <h2 id="prices">관람료</h2>
          <div className="note" style={{ marginTop: 12 }}>
            이 지점은 드라이브인 등 상영관 형태가 일반 극장과 달라 표준 요금표를 확인하지
            못했습니다. {info.name} 공식 사이트에서 정확한 요금을 확인해주세요.
          </div>
        </section>
      )}

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

      {!subway &&
        !bus &&
        !(itemSplit && itemSplit.subwayItems.length > 0) &&
        !transitFallback &&
        !cgvBusChips &&
        !cgvFallbackSubwayText && (
          <section className="section" aria-labelledby="transit">
            <h2 id="transit">대중교통 이용 방법</h2>
            <div className="note" style={{ marginTop: 12 }}>
              이 지점의 대중교통 안내는 아직 확인하지 못했습니다. {info.name} 공식 사이트에서
              확인해주세요.
            </div>
          </section>
        )}

      {(subway ||
        bus ||
        (itemSplit && (itemSplit.subwayItems.length > 0 || itemSplit.busItems.length > 0)) ||
        transitFallback ||
        cgvBusChips ||
        cgvFallbackSubwayText) && (
        <section className="section" aria-labelledby="transit">
          <h2 id="transit">대중교통 이용 방법</h2>
          <div className="transit-grid">
            {(subway || (itemSplit && itemSplit.subwayItems.length > 0) || cgvFallbackSubwayText) && (
              <div className="transit-card">
                <div className="transit-card-head">
                  <IconSubway />
                  지하철
                </div>
                {subway ? (
                  <BulletList text={subway} />
                ) : itemSplit && itemSplit.subwayItems.length > 0 ? (
                  <TransitItemsList items={itemSplit.subwayItems} />
                ) : (
                  <BulletList text={cgvFallbackSubwayText!} />
                )}
              </div>
            )}
            {/* cgvBusChips가 원문에서 버스 카테고리를 이미 뽑아갔으니, 같은
                내용이 "교통 안내" 원문 카드에 또 뜨지 않도록 그때만 숨긴다. */}
            {transitFallback && !cgvBusChips && (
              <div className="transit-card">
                <div className="transit-card-head">
                  <IconBus />
                  {transitFallbackIsBusOnly ? '버스' : '교통 안내'}
                </div>
                <BulletList text={transitFallbackText!} />
              </div>
            )}
            {cgvBusChips ? (
              <div className="transit-card">
                <div className="transit-card-head">
                  <IconBus />
                  버스
                </div>
                <TransitItemsList items={cgvBusChips} />
              </div>
            ) : (
              (bus || (itemSplit && itemSplit.busItems.length > 0)) && (
                <div className="transit-card">
                  <div className="transit-card-head">
                    <IconBus />
                    버스
                  </div>
                  {bus ? <BulletList text={bus} /> : <TransitItemsList items={itemSplit!.busItems} />}
                </div>
              )
            )}
          </div>
        </section>
      )}

      {parkingSections.length === 0 && (
        <section className="section" aria-labelledby="parking">
          <h2 id="parking">주차 안내</h2>
          <div className="note" style={{ marginTop: 12 }}>
            이 지점의 주차 안내는 아직 확인하지 못했습니다. {info.name} 공식 사이트에서
            확인해주세요.
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

/**
 * 지점 페이지의 자주 묻는 질문을 실제 데이터에서 만든다.
 *
 * 원칙: 데이터가 없으면 그 질문 자체를 넣지 않는다. "확인이 필요합니다" 같은
 * 빈 답변을 FAQ로 내보내면 음성검색·AI가 그 문장을 그대로 인용해버려서, 없느니만
 * 못한 결과가 된다. 답변 문장은 본문에 이미 있는 사실만 다시 쓴다(새 주장 금지).
 */
function buildBranchFaqs(b: Branch, brandName: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const full = `${b.name} ${brandName}`;

  if (b.address) {
    const tel = b.tel ? ` 전화번호는 ${formatTel(b.tel)}입니다.` : '';
    faqs.push({
      q: `${full}${subjectParticle(full)} 어디에 있나요?`,
      a: `주소는 ${b.address}입니다.${tel}`,
    });
  }

  // 관람료는 "일반(2D) + 일반 시간대 + 성인" 기준으로만 답한다 — 상영관·시간대별
  // 요금이 수십 줄이라 전부 나열하면 답변으로 못 쓴다. 3사 모두 timeSlot '일반'을
  // 표준 회차로 쓰는 것을 데이터에서 확인했다.
  const rows = pricesOf(b.id);
  const standard = rows.filter((r) => r.timeSlot === '일반' && r.adult != null);
  const baseLabel = standard[0]?.label;
  const wk = standard.find((r) => r.label === baseLabel && r.dayType === '평일');
  const we = standard.find((r) => r.label === baseLabel && r.dayType === '주말');
  if (wk?.adult != null || we?.adult != null) {
    const parts = [
      wk?.adult != null ? `평일 ${wk.adult.toLocaleString()}원` : null,
      we?.adult != null ? `주말 ${we.adult.toLocaleString()}원` : null,
    ].filter(Boolean);
    faqs.push({
      q: `${full} 관람료는 얼마인가요?`,
      a: `${baseLabel} 성인 기준 ${parts.join(', ')}입니다. 상영관 종류와 시간대(모닝·브런치 등)에 따라 요금이 달라집니다.`,
    });
  }

  // 주차는 "주차 요금" 카드 본문의 앞부분만 쓴다. 원문이 길고 예외 조항이 많아
  // 통째로 넣으면 답변이 문단이 되어버린다.
  const fee = buildParkingSections(b).find((s) => s.title === '주차 요금')?.body;
  if (fee) {
    const summary = fee
      .split('\n')
      .map((l) => l.replace(/^[-●•○★■ㆍ]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(' ');
    if (summary) {
      faqs.push({
        q: `${full} 주차 요금은 어떻게 되나요?`,
        a: `${summary} 자세한 조건과 인증 방법은 위 주차 안내를 확인해주세요.`,
      });
    }
  }

  faqs.push({
    q: `${full} 상영시간표는 어디서 확인하나요?`,
    a: `실시간 상영시간표와 예매는 ${brandName} 공식 사이트에서 제공됩니다. 이 페이지의 '${full} 상영시간표 확인' 버튼을 누르면 해당 지점의 공식 시간표로 바로 이동합니다.`,
  });

  return faqs;
}

/**
 * 앞 단어의 받침 유무에 따라 주격 조사 은/는을 고른다.
 * 지점명+브랜드명이 통째로 들어오므로 마지막 글자만 본다. 영문으로 끝나는
 * 경우(CGV=씨지비)는 3사 브랜드명 모두 모음으로 읽혀서 '는'이 맞다.
 */
function subjectParticle(word: string): '은' | '는' {
  const code = word.charCodeAt(word.length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 === 0 ? '는' : '은';
  return '는';
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
