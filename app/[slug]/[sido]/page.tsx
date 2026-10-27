import { withOpenGraphUrl } from '@/lib/metadata';
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
  isOperating,
} from '@/lib/data';
import { sidoIntro } from '@/lib/content';
import { guidePath, GUIDES } from '@/lib/paths';
import { baseFare, brandFareSummaries, MORNING_SLOT, won } from '@/lib/fares';
import { parkingSummary } from '@/lib/parking';
import { screensInBranches } from '@/lib/screens';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';
import { brandThemeVars } from '@/lib/colors';
import type { Branch } from '@/lib/types';
import type { CSSProperties } from 'react';

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

  return withOpenGraphUrl({
    title: `${sido} ${info.name} 지점 ${count}곳 위치와 상영시간표 안내`,
    description: `${sido} ${info.name} 지점 ${count}곳의 주소, 가는 길, 주차 조건, 관람료. 지점마다 공식 상영시간표로 연결해요.`,
    alternates: { canonical: sidoPath(info.segment, sido) },
  });
}

function formatBranchParking(b: Branch): string {
  if (!isOperating(b)) return b.status;
  const s = parkingSummary(b);
  if (!s) return '지점 페이지 참고';
  const parts: string[] = [];
  if (s.free === '관람 시') parts.push('관람 시 무료');
  else if (s.free) parts.push(`${s.free} 무료`);
  else if (s.flat) parts.push(`할인 ${s.flat}`);
  if (s.overage) parts.push(`초과 ${s.overage}`);
  if (parts.length === 0 && s.verify) parts.push(`${s.verify} 인증`);
  return parts.join(' · ') || '지점 페이지 참고';
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

  const operatingList = list.filter(isOperating);
  const specialCount = operatingList.filter((b) => b.specialScreens.length > 0).length;
  const cityCount = new Set(list.map((b) => b.sigungu).filter(Boolean)).size;
  const summaries = brandFareSummaries(sido);
  const fare = summaries.find((s) => s.brand === key) ?? null;
  const screens = screensInBranches(list);

  const byCity = new Map<string, typeof list>();
  for (const b of list) {
    const city = b.sigungu?.trim() || sido;
    byCity.set(city, [...(byCity.get(city) ?? []), b]);
  }
  const cities = [...byCity.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ko'));
  const groupByCity = cities.length >= 3;
  const otherSidos = sidosOfBrand(key).filter((s) => s !== sido);
  const themeVars = brandThemeVars(key) as CSSProperties;

  const citySummaryText = cities.map(([c, g]) => `${c}(${g.length}곳)`).join(', ');
  const freeParkingBranches = operatingList.filter((b) => parkingSummary(b)?.free != null);
  const morningLabel = MORNING_SLOT[key];

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
          <li><Link href="/">홈</Link></li>
          <li><Link href={brandPath(info.segment)}>{info.name}</Link></li>
          <li>{sido}</li>
        </ol>
      </nav>

      <h1>{sido} {info.name} 지점 {list.length}곳</h1>
      <p className="guide-lead">{sidoIntro(info.name, sido, list.length, specialCount, cityCount)}</p>

      <section className="section" aria-labelledby="branches">
        <h2 id="branches">{groupByCity ? `시·군·구별 지점 (${cities.length}개 지역)` : `${sido} 지점 목록`}</h2>
        {groupByCity &&
          cities.map(([city, group]) => (
            <div key={city} className="city-group">
              <h3 className="city-group-head">{city} <span className="count">{group.length}곳</span></h3>
              <ul className="chip-list">
                {group.map((b) => (
                  <li key={b.id}>
                    <Link className="chip" href={branchPath(b)}>{b.name}{b.status !== '운영중' && ` (${b.status})`}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <div className="card-grid cols-2" style={{ marginTop: 16 }}>
          {list.map((b) => (
            <Link key={b.id} href={branchPath(b)} className="card">
              <div className="card-title">{b.name} {info.name}</div>
              <div className="card-sub">{b.address}</div>
              {(b.specialScreens.length > 0 || b.status !== '운영중') && (
                <div className="badges">
                  {b.status !== '운영중' && <span className="badge badge-closed">{b.status}</span>}
                  {/* 휴관·폐점 지점은 특별관 뱃지를 붙이지 않는다 — 지금 운영하는 관이 아니다 */}
                  {b.status === '운영중' && b.specialScreens.slice(0, 3).map((s) => <span key={s} className="badge">{s}</span>)}
                  {b.status === '운영중' && b.specialScreens.length > 3 && <span className="badge">외 {b.specialScreens.length - 3}</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="branch-summary-table">
        <h2 id="branch-summary-table">{sido} {info.name} 지점별 요금·주차·상영관</h2>
        <p className="section-kicker">
          지점별 성인 평일·주말 요금, 무료 주차 조건, 특별관을 한 표에 모았어요. 지점 이름을 누르면 교통편과 시간대별 요금표가 나와요.
        </p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">지점명</th>
                <th scope="col">평일·주말 요금</th>
                <th scope="col">주차</th>
                <th scope="col">특별관·규모</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const bf = isOperating(b) ? baseFare(b) : null;
                const scale =
                  b.screenCount != null
                    ? `${b.screenCount}개관${b.seatCount != null ? ` · ${b.seatCount.toLocaleString()}석` : ''}`
                    : null;
                return (
                  <tr key={b.id}>
                    <th scope="row">
                      <Link className="guide-inline-link" href={branchPath(b)}>{b.name}</Link>
                      <span className="subline">{b.sigungu ?? sido}{b.status !== '운영중' ? ` · ${b.status}` : ''}</span>
                    </th>
                    <td>
                      {bf ? (
                        <>
                          평일 {won(bf.weekdayAdult)} · 주말 {won(bf.weekendAdult)}
                          <span className="subline">
                            {bf.label}
                            {bf.morningAdult != null ? ` · ${bf.morningSlot} ${won(bf.morningAdult)}` : ''}
                          </span>
                        </>
                      ) : (
                        <span className="muted">{b.status !== '운영중' ? b.status : '요금표 없음'}</span>
                      )}
                    </td>
                    <td>{formatBranchParking(b)}</td>
                    <td>
                      {isOperating(b) && b.specialScreens.length > 0
                        ? b.specialScreens.join(', ')
                        : '일반 상영관'}
                      {scale && <span className="subline">{scale}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {fare && (
        <section className="section" aria-labelledby="sido-fare">
          <h2 id="sido-fare">{sido} {info.name} 관람료 요약</h2>
          <p className="section-kicker">일반관 2D(없으면 그 지점의 기본 상영관), 일반 시간대, 성인 기준이에요.</p>
          <div className="data-table-shell">
            <table className="data-table data-table--region">
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
                {fare.morningLow != null && (
                  <tr>
                    <th scope="row">{morningLabel}  최저 요금</th>
                    <td colSpan={2}>{won(fare.morningLow)}</td>
                  </tr>
                )}
                {fare.weekdayLow !== fare.weekdayHigh && (
                  <tr>
                    <th scope="row">평일 지점 범위</th>
                    <td colSpan={2}>{won(fare.weekdayLow)} ~ {won(fare.weekdayHigh)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="section-kicker">
            상영관·시간대별 금액은 지점 페이지에, 세 브랜드 전국 비교는 <Link className="guide-inline-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link>와 <Link className="guide-inline-link" href={guidePath(GUIDES.discounts)}>할인·우대 안내</Link>에 있어요.
          </p>
        </section>
      )}

      {screens.length > 0 && (
        <section className="section" aria-labelledby="sido-screens">
          <h2 id="sido-screens">{sido}에서 볼 수 있는 {info.name} 특별관</h2>
          <p className="section-kicker">{sido}의 {info.name} 지점 중 {specialCount}곳에 특별관이 있어요.</p>
          <dl className="screen-notes" style={{ marginTop: 14 }}>
            {screens.map((s) => (
              <div key={s.name}>
                <dt>{s.name} <span className="fare-note">{s.branches.length}곳</span></dt>
                <dd>
                  {s.branches.map((b, i) => (
                    <span key={b.id}>{i > 0 && ' · '}<Link href={branchPath(b)}>{b.name}</Link></span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="section-kicker">상영 방식과 요금은 <Link className="guide-inline-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link>에 있어요.</p>
        </section>
      )}

      <section className="section" aria-labelledby="sido-faq">
        <h2 id="sido-faq">{sido} {info.name} 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>{sido}에는 {info.name} 지점이 어디에 있나요?</dt>
            <dd>
              {citySummaryText}에 모두 {list.length}곳({list.map((b) => b.name).join(', ')})이 있어요. 지점 이름을
              누르면 도로명 주소와 지하철·버스 노선이 나와요.
            </dd>
          </div>
          {fare && (
            <div className="faq-item">
              <dt>{sido} {info.name} 관람료는 평일·주말, {morningLabel}에 얼마인가요?</dt>
              <dd>
                기본 상영관 성인 대표 요금은 평일 {won(fare.weekdayCommon)}, 주말 {won(fare.weekendCommon)}이에요.
                {fare.morningLow != null ? ` 평일 ${morningLabel}는 ${won(fare.morningLow)}부터예요. ` : ' '}
                청소년·경로·장애인 요금과 좌석 등급별 금액은 지점 페이지 요금표에 있어요.
              </dd>
            </div>
          )}
          <div className="faq-item">
            <dt>{sido} {info.name}는 무료 주차가 되나요?</dt>
            <dd>
              {freeParkingBranches.length > 0
                ? `${freeParkingBranches.map((b) => b.name).join(', ')} 등 ${freeParkingBranches.length}곳은 그날 관람하면 무료로 주차할 수 있어요. 무료 시간(3시간~3시간 30분, 또는 관람 시 무료)과 등록 방법은 지점마다 달라서 지점 페이지에서 확인하세요.`
                : `주차 요금과 정산 방법은 지점이 들어선 건물에 따라 달라요. 지점 페이지의 주차 항목에서 주차장 위치와 요금을 확인하세요.`}
            </dd>
          </div>
          <div className="faq-item">
            <dt>{sido} {info.name} 상영시간표는 어디서 보고, 예매 취소는 언제까지 되나요?</dt>
            <dd>
              지점 페이지의 &lsquo;상영시간표 확인&rsquo; 버튼을 누르면 그 지점의 {info.name} 공식 시간표·예매 페이지로 연결돼요. 웹·앱 예매는 보통 상영 20분 전까지 취소할 수 있어요. 주차 정산과 우대 요금은 <Link className="guide-inline-link" href={guidePath(GUIDES.parking)}>주차</Link>, <Link className="guide-inline-link" href={guidePath(GUIDES.discounts)}>할인·우대</Link> 안내에 있어요.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="other-regions">
        <h2 id="other-regions">다른 지역 {info.name} 지점</h2>
        <ul className="chip-list" style={{ marginTop: 14 }}>
          {otherSidos.map((s) => (
            <li key={s}>
              <Link className="chip" href={sidoPath(info.segment, s)}>{s} <span style={{ opacity: 0.7 }}>{meta.byBrandSido[key]?.[s] ?? 0}</span></Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="other-brand-same-sido">
        <h2 id="other-brand-same-sido">{sido}의 다른 브랜드</h2>
        <div className="card-grid cols-2" style={{ marginTop: 16 }}>
          {meta.brands
            .filter((b) => b.key !== key)
            .map((b) => {
              const n = meta.byBrandSido[b.key]?.[sido] ?? 0;
              if (n === 0) return null;
              return (
                <Link key={b.key} href={sidoPath(b.segment, sido)} className="card">
                  <div className="card-title">{sido} {b.name}</div>
                  <div className="card-sub">{n}개 지점</div>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
