import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, branchPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { won } from '@/lib/fares';
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
  title: '전국 특별관 안내 — 종류별 지점과 추가요금',
  description:
    '아이맥스·4DX·SCREENX·돌비시네마·리클라이너 등 전국 특별관을 종류별로 정리했습니다. 어느 지점에 있는지와 함께, 같은 지점 기본관보다 얼마나 비싼지를 요금표에서 계산했습니다.',
  alternates: { canonical: PATH },
};

/** 지점 칩을 너무 많이 깔면 목록이 아니라 링크 더미가 된다 */
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

  // 좌석 등급에 상관없이 기본관과 금액이 같은 특별관. "특별관 = 비싼 관"이라는
  // 통념과 달라서 따로 뽑는다. 최저만 0원이고 상위 좌석은 돈을 더 받는 관은
  // 여기 들어가면 안 되므로 최고까지 0원인 것만 센다.
  const noExtra = stats.filter((s) => s.extraLow === 0 && s.extraHigh === 0 && s.sampleSize >= 3);
  const priciest = stats
    .filter((s) => s.extraHigh != null && s.sampleSize >= 3)
    .sort((a, b) => b.extraHigh! - a.extraHigh!)[0];

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
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>특별관</li>
        </ol>
      </nav>

      <h1>전국 특별관 안내</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        전국 {meta.totalBranches}개 지점 가운데 {total}곳이 특별관을 함께 운영합니다. 브랜드마다
        이름을 자기식으로 붙여서 이름만으로는 무엇이 다른 관인지 알기 어렵기 때문에, 상영 방식
        기준으로 다시 묶고 같은 지점 기본관보다 얼마나 비싼지를 요금표에서 계산했습니다.
      </p>

      {priciest && (
        <div className="badges" style={{ marginTop: 16 }}>
          <span className="badge">{stats.length}종류</span>
          <span className="badge">특별관 운영 {total}곳</span>
          <span className="badge badge-brand">
            최대 추가요금 {priciest.kind.name} +{won(priciest.extraHigh!)}
          </span>
        </div>
      )}

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
                    {stat.brandNames.join('·')} · {stat.branchCount}곳
                    {stat.sampleSize > 0 && stat.sampleSize < stat.branchCount && (
                      <span className="fare-note"> (요금 확인 {stat.sampleSize}곳)</span>
                    )}
                  </p>
                  {stat.kind.desc && <p className="screen-card-desc">{stat.kind.desc}</p>}
                  <ul className="chip-list">
                    {shown.map((b) => (
                      <li key={b.id}>
                        <Link className="chip" href={branchPath(b)}>
                          {b.name} {b.brandName}
                        </Link>
                      </li>
                    ))}
                    {branches.length > shown.length && (
                      <li>
                        <span className="chip chip-plain">외 {branches.length - shown.length}곳</span>
                      </li>
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
          <h2 id="no-extra">추가요금이 없는 특별관도 있습니다</h2>
          <div className="prose" style={{ marginTop: 12 }}>
            <p>
              특별관이라고 해서 모두 비싼 것은 아닙니다. 아래 상영관은 요금표를 확인한 지점에서
              좌석 등급까지 통틀어 기본관과 금액이 같았습니다.
            </p>
          </div>
          <ul className="chip-list" style={{ marginTop: 4 }}>
            {noExtra.map((s) => (
              <li key={s.kind.name}>
                <span className="chip chip-plain">{s.kind.name}</span>
              </li>
            ))}
          </ul>
          <div className="prose" style={{ marginTop: 16 }}>
            <p>
              같은 값이라면 굳이 일반관을 고를 이유가 없으니, 예매 화면에서 상영관 이름을 한 번
              확인해볼 만합니다. 다만 여기 없는 특별관 중에는 좌석 등급에 따라 금액이 갈리는 곳이
              있습니다. 일반석은 추가요금이 없는데 모션석이나 리클라이너석만 따로 받는 식이라,
              위 목록의 추가요금을 구간으로 적어두었습니다.
            </p>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="naming">
        <h2 id="naming">이름은 달라도 같은 방식인 관</h2>
        <div className="prose" style={{ marginTop: 12 }}>
          <p>
            좌석이 움직이고 바람·물 같은 효과가 함께 나오는 상영관을 CGV는 4DX, 롯데시네마는 수퍼
            4D와 수퍼MX4D, 메가박스는 MEGA | MX4D로 부릅니다. 등받이가 눕는 좌석도 롯데시네마는
            리클라이너, 메가박스는 LE RECLINER by MEGA로 이름이 갈립니다. 브랜드를 옮겨 다니며
            비교할 때는 이름이 아니라 위 분류를 기준으로 보시면 됩니다.
          </p>
          <p>
            돌비 계열은 표기가 특히 여러 갈래입니다. 음향 규격만 적용한 관(DOLBY ATMOS, MEGA |
            DOLBY ATMOS)과 영상 규격까지 함께 적용한 관(DOLBY CINEMA, DOLBY VISION+ATMOS)이
            따로 있고, 요금 차이도 그만큼 벌어집니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">집계 기준</h2>
        <div className="prose" style={{ marginTop: 12 }}>
          <p>
            추가요금은 <strong>같은 지점의 기본관 평일 일반 시간대 성인 요금</strong>과의 차액입니다.
            지점마다 기본 요금이 다르기 때문에 절대 금액이 아니라 차액으로만 비교할 수 있습니다.
            지점별로 편차가 있어 평균 대신 중앙값을 썼고, 요금표에서 해당 상영관을 찾지 못한 지점은
            계산에서 뺐습니다.
          </p>
          <p>
            한 상영관 안에서 좌석 등급이 나뉘면 금액을 하나로 적을 수 없어 구간으로 표시했습니다.
            예를 들어 MX4D관에는 좌석이 움직이지 않는 일반석이 함께 있어서, 같은 관인데도 어느
            자리를 고르느냐로 요금이 달라집니다.
          </p>
          <p>
            3D는 상영관 등급이 아니라 같은 관의 상영 방식 차이라 제외했습니다. 상영 방식에 대한
            설명은 확인된 사실만 적었고, 확인하지 못한 상영관은 이름과 지점 수, 요금 차이만
            표시했습니다.
          </p>
          <p className="updated">
            요금 확인일 {meta.checkedAt} · 종류별 실제 금액은 각 지점 페이지에서 확인하시고, 예매
            전에는 공식 페이지에서 최종 금액을 확인하시기 바랍니다. 브랜드·지역별 요금 차이는{' '}
            <Link href={guidePath(GUIDES.fares)}>관람료 비교</Link>에 정리했습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
