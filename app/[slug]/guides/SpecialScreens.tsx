import { withOpenGraphUrl } from '@/lib/metadata';
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

export const specialScreensMetadata: Metadata = withOpenGraphUrl({
  title: '전국 특별관 안내 — IMAX·4DX·SCREENX·돌비 등',
  description:
    'CGV·롯데시네마·메가박스 특별관을 상영 방식별로 묶었어요. IMAX, 4DX, SCREENX, 돌비 계열, 리클라이너가 있는 지점과 추가 요금.',
  alternates: { canonical: PATH },
});

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
      <p className="guide-lead">{meta.totalBranches}개 지점 중 {total}곳에 특별관이 있어요. 모두 {stats.length}종류이고, 브랜드마다 이름이 달라도 방식이 같으면 한 묶음으로 모았어요.</p>

      <ul className="guide-jump-list" aria-label="다른 안내">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·우대</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화 순위</Link></li>
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
          <h2 id="no-extra">기본관과 요금이 같은 특별관</h2>
          <p className="section-kicker">요금표를 확인한 지점에서 좌석 등급까지 기본관과 같은 금액으로 적힌 상영관이에요.</p>
          <ul className="chip-list" style={{ marginTop: 14 }}>
            {noExtra.map((s) => (
              <li key={s.kind.name}><span className="chip chip-plain">{s.kind.name}</span></li>
            ))}
          </ul>
        </section>
      )}

      <section className="section" aria-labelledby="selection-guide">
        <h2 id="selection-guide">어떤 영화를 어느 관에서 볼까</h2>
        <div className="prose">
          <h3>큰 화면이 중요한 영화 (SF·블록버스터)</h3>
          <p>
            IMAX 카메라로 찍었거나 1.43:1, 1.90:1 화면비를 지원하는 영화는 일반관(2.39:1)보다 화면 위아래가 더 보여요. CGV <strong>IMAX</strong>와 롯데시네마 <strong>수퍼플렉스</strong>가 여기에 맞고, 좌우 벽까지 화면을 넓히는 <strong>SCREENX</strong>도 있어요.
          </p>

          <h3>소리와 색이 중요한 영화 (음악 영화·공연 실황)</h3>
          <p>
            천장 스피커까지 따로 소리를 내는 <strong>DOLBY ATMOS</strong>나, 여기에 돌비 비전 영사기를 더한 <strong>DOLBY CINEMA</strong>에서 차이가 잘 느껴져요. 롯데시네마에는 저음과 출력을 키운 <strong>광음시네마</strong>가 있어요.
          </p>

          <h3>움직임을 느끼고 싶은 영화 (액션·레이싱·애니메이션)</h3>
          <p>
            장면에 맞춰 좌석이 흔들리고 바람·물·향기 효과가 나오는 관은 CGV <strong>4DX</strong>, 롯데시네마 <strong>수퍼 4D·수퍼MX4D</strong>, 메가박스 <strong>MEGA | MX4D</strong>예요. 멀미가 심한 사람, 임산부, 키가 기준보다 작은 어린이는 이용이 제한될 수 있고 뜨거운 음료는 피하는 게 좋아요.
          </p>

          <h3>긴 영화를 편하게 보고 싶을 때</h3>
          <p>
            2시간 30분이 넘는 영화라면 등받이와 발받침을 조절하는 <strong>리클라이너관</strong>, 좌석 간격이 넓은 <strong>COMFORT관</strong>, 좌석 수가 적은 <strong>샤롯데·BOUTIQUE by MEGA</strong>가 편해요.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="naming">
        <h2 id="naming">브랜드마다 다른 특별관 이름</h2>
        <p className="guide-copy">같은 방식이어도 브랜드마다 이름이 달라요. 좌석이 움직이는 관은 CGV 4DX, 롯데시네마 수퍼4D·수퍼MX4D, 메가박스 MEGA | MX4D이고, 리클라이너는 롯데시네마 리클라이너, 메가박스 LE RECLINER by MEGA라고 불러요. 돌비 계열은 음향만 바꾼 DOLBY ATMOS와 영상·음향을 함께 바꾼 DOLBY CINEMA를 나눠 적었어요.</p>
      </section>

      <section className="section" aria-labelledby="screen-faq">
        <h2 id="screen-faq">특별관 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>일반 관람권이나 통신사 무료 예매로 특별관도 볼 수 있나요?</dt>
            <dd>
              대부분의 일반 관람권과 통신사 무료 예매는 일반관에서만 쓸 수 있어요. IMAX, 4DX, 돌비 시네마, 샤롯데 같은 특별관은 전용 관람권을 쓰거나, 차액을 내고 예매할 수 있는지 예매 화면에서 확인하세요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>DOLBY CINEMA와 DOLBY ATMOS는 무엇이 다른가요?</dt>
            <dd>
              DOLBY ATMOS는 천장 스피커를 포함한 입체 음향만 갖춘 관이에요. DOLBY CINEMA는 여기에 돌비 비전 레이저 영사기와 전용 상영관 설계까지 더한 규격이에요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>리클라이너관은 늘 추가 요금이 있나요?</dt>
            <dd>
              일반관과 리클라이너관을 함께 둔 지점은 리클라이너관에 1,000~3,000원을 더 받기도 해요. 모든 관이 리클라이너인 지점은 그 요금이 곧 기본 요금이에요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>우리 동네 근처의 특별관은 어떻게 찾나요?</dt>
            <dd>
              지점 페이지 아래쪽 &lsquo;근처 다른 영화관&rsquo; 표에 주변 영화관의 특별관이 나와요. 시도별 지점 목록에서도 그 지역의 특별관 보유 지점만 모아 볼 수 있어요.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="basis">
        <h2 id="basis">집계 기준</h2>
        <p className="guide-copy">추가 요금은 같은 지점 기본관의 평일 일반 시간대 성인 요금과 비교한 값이에요. 지점마다 다르면 중앙값을 쓰고, 한 관 안에서 좌석 등급별로 금액이 다르면 범위로 적었어요. 3D는 특별관이 아니라 상영 방식이라 넣지 않았어요.</p>
        <p className="section-kicker">요금 확인일 {meta.checkedAt} · 운영 여부와 최종 금액은 지점 공식 페이지에서 확인하세요.</p>
      </section>
    </div>
  );
}
