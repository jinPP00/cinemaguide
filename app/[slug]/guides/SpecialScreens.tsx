import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, branchPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import {
  screenStats,
  branchesWithScreen,
  specialScreenBranchCount,
  formatExtra,
  SCREEN_GROUP_ORDER,
  SCREEN_GROUP_HEADING,
  type ScreenGroup,
  type ScreenStat,
} from '@/lib/screens';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';

const PATH = guidePath(GUIDES.screens);

export const specialScreensMetadata: Metadata = {
  title: '전국 특별관 안내 — IMAX·4DX·SCREENX·돌비 등',
  description:
    'CGV·롯데시네마·메가박스 특별관을 상영 방식별로 정리했습니다. IMAX, 4DX, SCREENX, 돌비 계열, 리클라이너 등의 운영 지점과 요금 정보를 확인할 수 있습니다.',
  alternates: { canonical: PATH },
};

const CHIP_LIMIT = 12;

export default function SpecialScreensPage() {
  const stats = screenStats();
  const total = specialScreenBranchCount();
  const byGroup = new Map<ScreenGroup, ScreenStat[]>();
  for (const stat of stats) {
    const list = byGroup.get(stat.kind.group) ?? [];
    list.push(stat);
    byGroup.set(stat.kind.group, list);
  }

  const noExtra = stats.filter((s) => s.extraLow === 0 && s.extraHigh === 0 && s.sampleSize >= 3);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '특별관', path: PATH },
  ];

  return (
    <div className="wrap page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(PATH, dataGeneratedAt.toISOString()),
        )}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li>특별관</li>
        </ol>
      </nav>

      <h1>전국 특별관 안내</h1>
      <p className="guide-lead">전국 {meta.totalBranches}개 지점 중 {total}곳에서 확인된 특별관을 화면·좌석·음향·체감형 상영 방식 기준으로 묶었습니다. 브랜드별 명칭이 달라도 같은 방식이면 같은 그룹에서 볼 수 있습니다.</p>

      <div className="badges" style={{ marginTop: 16 }}>
        <span className="badge">확인된 특별관 {stats.length}종류</span>
        <span className="badge">특별관 운영 {total}곳</span>
      </div>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화순위</Link></li>
      </ul>

      {SCREEN_GROUP_ORDER.filter((g) => byGroup.has(g)).map((group) => (
        <section className="section" key={group} aria-labelledby={`group-${group}`}>
          <h2 id={`group-${group}`}>{SCREEN_GROUP_HEADING[group]}</h2>
          <div className="screen-cards">
            {byGroup.get(group)!.map((stat) => {
              const branches = branchesWithScreen(stat.kind.name);
              const shown = branches.slice(0, CHIP_LIMIT);
              return (
                <article className="screen-card" key={stat.kind.name}>
                  <div className="screen-card-head">
                    <h3>{stat.kind.name}</h3>
                    <span className="screen-card-extra">{formatExtra(stat)}</span>
                  </div>
                  <p className="screen-card-meta">
                    {stat.brandNames.join(' · ')} · {stat.branchCount}곳
                    {stat.sampleSize > 0 && stat.sampleSize < stat.branchCount && (
                      <span className="fare-note"> · 요금 확인 {stat.sampleSize}곳</span>
                    )}
                  </p>
                  {stat.kind.desc && <p className="screen-card-desc">{stat.kind.desc}</p>}
                  <ul className="chip-list">
                    {shown.map((b) => (
                      <li key={b.id}>
                        <Link className="chip" href={branchPath(b)}>{b.name} {b.brandName}</Link>
                      </li>
                    ))}
                    {branches.length > shown.length && (
                      <li><span className="chip chip-plain">외 {branches.length - shown.length}곳</span></li>
                    )}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {noExtra.length > 0 && (
        <section className="section" aria-labelledby="no-extra">
          <h2 id="no-extra">기본관과 같은 요금으로 확인된 특별관</h2>
          <p className="section-kicker">요금표를 확인한 지점에서 좌석 등급을 포함해 기본관과 같은 금액으로 표시된 상영관입니다.</p>
          <ul className="chip-list" style={{ marginTop: 14 }}>
            {noExtra.map((s) => (
              <li key={s.kind.name}><span className="chip chip-plain">{s.kind.name}</span></li>
            ))}
          </ul>
        </section>
      )}

      <section className="section" aria-labelledby="naming">
        <h2 id="naming">브랜드마다 다른 특별관 이름</h2>
        <p className="guide-copy">좌석 움직임과 바람·물 등 환경 효과를 사용하는 관은 CGV 4DX, 롯데시네마 수퍼4D·수퍼MX4D, 메가박스 MEGA | MX4D처럼 브랜드별 이름이 다릅니다. 리클라이너 좌석도 롯데시네마 리클라이너, 메가박스 LE RECLINER by MEGA처럼 표기가 다르며, 돌비 계열은 음향만 적용한 DOLBY ATMOS와 영상·음향을 함께 적용한 DOLBY CINEMA 계열을 구분해 표시했습니다.</p>
      </section>

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">집계 기준</h2>
        <p className="guide-copy">추가요금은 같은 지점의 기본관 평일 일반 시간대 성인 요금과 비교했습니다. 지점별 편차가 있는 경우 중앙값을 사용하고, 한 상영관 안에서 좌석 등급별 금액이 다르면 구간으로 표시합니다. 3D는 특별관 등급이 아니라 상영 방식 차이이므로 특별관 추가요금 집계에서 제외했습니다.</p>
        <p className="section-kicker">요금 확인일 {meta.checkedAt} · 실제 운영 여부와 최종 금액은 각 지점 공식 페이지에서 확인하세요.</p>
      </section>
    </div>
  );
}
