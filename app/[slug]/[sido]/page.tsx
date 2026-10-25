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
    description: `${sido} 지역 ${info.name} 지점 ${count}곳의 주소와 가는 길, 주차 조건, 관람료 정보를 정리했습니다. 지점별 공식 상영시간표로 바로 이동할 수 있습니다.`,
    alternates: { canonical: sidoPath(info.segment, sido) },
  });
}

function formatBranchParking(b: Branch): string {
  if (!isOperating(b)) return b.status;
  const s = parkingSummary(b);
  if (!s) return '상세 페이지 참고';
  const parts: string[] = [];
  if (s.free === '관람 시') parts.push('관람 시 무료');
  else if (s.free) parts.push(`${s.free} 무료`);
  else if (s.flat) parts.push(`할인 ${s.flat}`);
  if (s.overage) parts.push(`초과 ${s.overage}`);
  if (parts.length === 0 && s.verify) parts.push(`${s.verify} 인증`);
  return parts.join(' · ') || '상세 페이지 참고';
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
              <div className="card-more">지점 정보 보기 →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="branch-summary-table">
        <h2 id="branch-summary-table">{sido} {info.name} 지점별 요금·주차·상영관 비교</h2>
        <p className="section-kicker">
          {sido} 지역 각 지점의 기준 관람료(성인 평일·주말), 무료 주차 조건, 특별관 보유 여부를 한 표에 정리했습니다. 지점명을 누르면 대중교통 노선과 전체 시간대별 요금표를 볼 수 있습니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">지점명</th>
                <th scope="col">평일·주말 기준 요금</th>
                <th scope="col">주차 요약</th>
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
                        <span className="muted">{b.status !== '운영중' ? b.status : '요금표 미확인'}</span>
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
          <p className="section-kicker">일반 상영관 2D(또는 해당 지점 기본 상영관), 일반 시간대, 성인 기준입니다.</p>
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
                    <th scope="row">{morningLabel} 시간대 시작 요금</th>
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
            상영관·시간대별 상세 금액은 각 지점 페이지에서 확인하고, 3사 전국 비교는 <Link className="guide-inline-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link>와 <Link className="guide-inline-link" href={guidePath(GUIDES.discounts)}>할인·예매 가이드</Link>에서 볼 수 있습니다.
          </p>
        </section>
      )}

      {screens.length > 0 && (
        <section className="section" aria-labelledby="sido-screens">
          <h2 id="sido-screens">{sido}에서 볼 수 있는 {info.name} 특별관</h2>
          <p className="section-kicker">{sido} 지역 {info.name} 지점 중 {specialCount}곳에서 특별관이 확인됩니다.</p>
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
          <p className="section-kicker">상영 방식과 요금 정보는 <Link className="guide-inline-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link>에서 확인할 수 있습니다.</p>
        </section>
      )}

      <section className="section" aria-labelledby="sido-faq">
        <h2 id="sido-faq">{sido} {info.name} 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>{sido} 지역에는 {info.name} 지점이 어디에 있나요?</dt>
            <dd>
              {sido}에는 {citySummaryText}에 걸쳐 총 {list.length}개의 {info.name} 지점({list.map((b) => b.name).join(', ')})이 있습니다. 각 지점 이름을 선택하면 도로명 주소와 지하철·버스 노선을 확인할 수 있습니다.
            </dd>
          </div>
          {fare && (
            <div className="faq-item">
              <dt>{sido} {info.name}의 평일·주말 관람료와 {morningLabel} 요금은 얼마인가요?</dt>
              <dd>
                {sido} 지역 {info.name}의 기본 상영관 성인 대표 요금은 평일 {won(fare.weekdayCommon)}, 주말 {won(fare.weekendCommon)}입니다.
                {fare.morningLow != null ? ` 평일 ${morningLabel} 시간대는 ${won(fare.morningLow)}부터 시작하며, ` : ' '}
                청소년·경로·장애인 우대 요금과 좌석 등급별 금액은 각 지점 페이지의 요금표에 정리되어 있습니다.
              </dd>
            </div>
          )}
          <div className="faq-item">
            <dt>{sido} {info.name} 방문 시 무료 주차가 가능한가요?</dt>
            <dd>
              {freeParkingBranches.length > 0
                ? `${sido} ${info.name} 운영 지점 중 ${freeParkingBranches.map((b) => b.name).join(', ')} 등 ${freeParkingBranches.length}곳에서 당일 영화 관람 시 무료 주차 혜택을 제공합니다. 지점마다 무료 인정 시간(예: 3시간~3시간 30분 또는 관람 시 무료)과 사전 차량 등록 방식이 다르므로 위 비교 표와 지점 상세 안내를 확인해 주세요.`
                : `${sido} 지역 각 지점의 입점 건물 형태에 따라 주차 요금과 정산 방식이 다르게 운영됩니다. 방문 전 해당 지점 상세 페이지의 주차 안내 섹션에서 주차장 위치와 요금 조건을 확인해 주세요.`}
            </dd>
          </div>
          <div className="faq-item">
            <dt>{sido} {info.name} 상영시간표 확인과 온라인 예매 취소 마감 기준은 어떻게 되나요?</dt>
            <dd>
              이 페이지에서 방문할 지점을 선택한 뒤 지점 상세 화면의 &lsquo;상영시간표 확인&rsquo; 버튼을 누르면 해당 지점의 {info.name} 공식 시간표·예매 페이지로 바로 연결됩니다. 온라인·모바일 앱 예매 취소는 통상 상영 시작 20분 전까지 가능하며, 차량 방문 전 정산 방법과 시간대별 우대 요금 규정은 <Link className="guide-inline-link" href={guidePath(GUIDES.parking)}>주차 가이드</Link>와 <Link className="guide-inline-link" href={guidePath(GUIDES.discounts)}>할인 가이드</Link>에서 함께 확인하실 수 있습니다.
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
        <h2 id="other-brand-same-sido">{sido} 지역 다른 브랜드</h2>
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
                  <div className="card-more">지점 보기 →</div>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
