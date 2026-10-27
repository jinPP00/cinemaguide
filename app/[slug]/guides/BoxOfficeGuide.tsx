import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, brandPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { boxOfficeLastModified } from '@/lib/dates';
import type { BoxOffice } from '@/lib/types';
import BoxOfficeSection from '../BoxOfficeSection';
import boxofficeData from '../../../public/boxoffice.json';

const boxoffice = boxofficeData as BoxOffice;
const PATH = guidePath(GUIDES.boxoffice);

export const boxOfficeMetadata: Metadata = withOpenGraphUrl({
  title: '영화순위 — 박스오피스 순위와 영화 정보',
  description:
    '영화진흥위원회(KOBIS) 집계 박스오피스 순위. 집계일·누적 관객 수, 매출 점유율, 개봉일, 감독, 출연, 러닝타임, 관람등급.',
  alternates: { canonical: PATH },
});

function formatTargetDate(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  return `${y}년 ${m}월 ${d}일`;
}

export default function BoxOfficePage() {
  const movies = boxoffice.movies;
  const top1 = movies[0];
  const top3Share = movies
    .slice(0, 3)
    .reduce((sum, m) => sum + (m.salesShare || 0), 0)
    .toFixed(1);
  const totalDailyAudience = movies.reduce((sum, m) => sum + (m.audienceToday || 0), 0);
  const runtimes = movies.map((m) => m.runtime).filter((r): r is number => r != null && r > 0);
  const avgRuntime =
    runtimes.length > 0 ? Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length) : null;

  const crumbs = [
    { name: '홈', path: '/' },
    { name: '영화순위', path: PATH },
  ];

  return (
    <div className="wrap page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(PATH, boxOfficeLastModified.toISOString()),
        )}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li>영화순위</li>
        </ol>
      </nav>

      <h1>영화순위</h1>
      <p className="guide-lead">영화진흥위원회 통합전산망(KOBIS)의 {formatTargetDate(boxoffice.targetDate)} 박스오피스입니다. 그날 관객 수 순서이고, 매주 월요일에 새로 받아 옵니다.</p>

      <ul className="guide-jump-list" aria-label="다른 안내">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·우대</Link></li>
      </ul>

      {top1 && (
        <section className="section" aria-labelledby="bo-summary">
          <h2 id="bo-summary">{formatTargetDate(boxoffice.targetDate)} 요약</h2>
          <p className="guide-copy">
            1위는 <strong>{top1.name}</strong>입니다. 이날 <span className="num">{top1.audienceToday.toLocaleString()}</span>명,
            개봉 뒤 누적 <span className="num">{top1.audienceTotal.toLocaleString()}</span>명이 봤습니다. 1~3위가 이날 매출의{' '}
            <span className="num">{top3Share}%</span>를 차지했고, 10위까지 합친 관객은{' '}
            <span className="num">{totalDailyAudience.toLocaleString()}</span>명입니다.
            {avgRuntime != null && <> 10위 안 영화의 평균 러닝타임은 {avgRuntime}분입니다.</>}
          </p>
        </section>
      )}

      <BoxOfficeSection data={boxoffice} />

      <section className="section" aria-labelledby="how-to-read">
        <h2 id="how-to-read">순위표 읽는 법</h2>
        <div className="prose">
          <p>
            순위는 그날 전국 극장에서 발권된 표를 기준으로 한 <strong>하루 관객 수</strong> 순서입니다. 누적 관객 수는 개봉(유료 시사 포함) 뒤 전체 관객이라, 신작이 개봉한 주에는 누적 순서와 하루 순위가 다르게 나옵니다.
          </p>
          <ul>
            <li>
              <strong>하루 관객과 누적 관객</strong>: 지금 상영관을 가장 많이 잡고 있는 영화는 하루 관객 상위권입니다. 오래 흥행하는지는 개봉일과 누적 관객을 함께 보면 알 수 있습니다.
            </li>
            <li>
              <strong>매출 점유율</strong>: 그날 전체 극장 매출에서 그 영화가 차지한 비율입니다. IMAX·4DX·돌비 시네마로 많이 보는 영화는 관객 수보다 점유율이 높게 나오기도 합니다.
            </li>
            <li>
              <strong>러닝타임과 주차</strong>: 영화를 누르면 나오는 러닝타임에 입장 대기, 광고, 퇴장 시간(40~50분)을 더하면 극장에 머무는 시간입니다. 140분이 넘는 영화라면 갈 지점의 무료 주차 시간을 미리 보세요.
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="booking-tips">
        <h2 id="booking-tips">예매 시점과 관람 등급</h2>
        <div className="prose">
          <h3>시간표는 언제 열리나</h3>
          <p>
            큰 영화가 개봉하는 주나 주말 시간표는 보통 상영일 2~4일 전부터 지점별로 차례로 열립니다(수요일 개봉작은 월~화요일쯤). IMAX·돌비 시네마·4DX 같은 특별관이 일반관보다 먼저 열리는 경우가 많고, 일반관은 전날 오후에 회차가 더 붙기도 합니다.
          </p>
          <h3>등급별 입장</h3>
          <p>
            <strong>전체관람가</strong>는 누구나 볼 수 있습니다. <strong>12세이상관람가</strong>와 <strong>15세이상관람가</strong>는 나이가 안 돼도 부모 등 보호자와 함께면 들어갈 수 있습니다. <strong>청소년관람불가</strong>는 보호자가 있어도 만 19세 미만은 볼 수 없고, 입장할 때 신분증을 확인합니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="where">
        <h2 id="where">상영시간표 찾기</h2>
        <p className="section-kicker">상영시간표는 각 영화관 공식 사이트에 있습니다. 브랜드를 고른 뒤 지점 페이지의 상영시간표 버튼을 누르세요.</p>
        <ul className="guide-jump-list">
          {meta.brands.map((b) => (
            <li key={b.key}>
              <Link className="guide-jump-link" href={brandPath(b.segment)}>{b.name} {b.count}개 지점</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="note">순위와 관객 수는 영화진흥위원회(KOBIS), 감독·출연·포스터는 한국영상자료원(KMDb) 자료입니다. 집계일 이후 바뀐 내용은 들어가 있지 않습니다.</div>
      </section>
    </div>
  );
}
