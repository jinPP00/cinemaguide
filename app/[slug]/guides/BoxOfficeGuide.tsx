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
    '영화진흥위원회(KOBIS) 집계 기준 박스오피스 순위와 집계일·누적 관객 수, 매출 점유율, 개봉일, 감독, 출연, 러닝타임, 관람등급을 확인할 수 있습니다.',
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
      <p className="guide-lead">영화진흥위원회 영화관입장권 통합전산망(KOBIS)의 {formatTargetDate(boxoffice.targetDate)} 박스오피스 순위입니다. 순위는 집계일 관객 수 기준이며 매주 월요일 갱신합니다.</p>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차 가이드</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·예매 가이드</Link></li>
      </ul>

      {top1 && (
        <section className="section" aria-labelledby="bo-summary">
          <h2 id="bo-summary">{formatTargetDate(boxoffice.targetDate)} 집계 요약</h2>
          <div className="fact-grid cols-3">
            <div className="fact-card">
              <span className="fact-label">1위 작품 · 일일 관객</span>
              <span className="fact-value">{top1.name}</span>
              <span className="fact-meta">
                집계일 {top1.audienceToday.toLocaleString()}명 · 누적 {top1.audienceTotal.toLocaleString()}명
              </span>
            </div>
            <div className="fact-card">
              <span className="fact-label">상위 1~3위 매출 점유율 합계</span>
              <span className="fact-value">{top3Share}%</span>
              <span className="fact-meta">10위권 전체 일일 관객 {totalDailyAudience.toLocaleString()}명</span>
            </div>
            {avgRuntime != null && (
              <div className="fact-card">
                <span className="fact-label">10위권 평균 러닝타임</span>
                <span className="fact-value">약 {avgRuntime}분</span>
                <span className="fact-meta">주차 무료 시간 확인 시 참고</span>
              </div>
            )}
          </div>
        </section>
      )}

      <BoxOfficeSection data={boxoffice} />

      <section className="section" aria-labelledby="how-to-read">
        <h2 id="how-to-read">박스오피스 집계 기준과 지표 읽는 법</h2>
        <div className="prose">
          <p>
            박스오피스 순위는 집계일 하루 동안 전국 극장에서 발권된 입장권 기준 <strong>일별 관객 수</strong>로 정해집니다. 누적 관객 수는 개봉(시사회·유료 시사 포함) 이후 전체 관객 수이므로, 신작이 개봉한 주간에는 누적 관객 수 순서와 일별 박스오피스 순위가 서로 다르게 나타날 수 있습니다.
          </p>
          <ul>
            <li>
              <strong>집계일 관객 수 vs 누적 관객 수</strong>: 지금 극장에서 가장 많은 상영관을 배정받고 있는 작품은 일별 관객 수 상위권 영화이며, 장기 흥행 여부는 개봉일과 누적 관객 수를 함께 비교해 파악할 수 있습니다.
            </li>
            <li>
              <strong>집계일 매출 점유율</strong>: 해당 날짜 전체 극장 매출액 가운데 그 작품이 차지한 비중(%)입니다. 아이맥스·4DX·돌비 시네마 등 특별관 관람 비중이 높은 작품은 관객 수 대비 매출 점유율이 더 높게 나타나기도 합니다.
            </li>
            <li>
              <strong>러닝타임과 주차 시간 계획</strong>: 각 영화를 눌러 확인할 수 있는 러닝타임에 입장 대기·광고 상영·퇴장 이동 시간(약 40~50분)을 더하면 실제 극장 체류 시간이 됩니다. 140분 이상 장편 영화 관람 시에는 방문할 지점의 무료 주차 시간을 미리 확인하는 것이 좋습니다.
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="booking-tips">
        <h2 id="booking-tips">인기 상영작 예매 및 관람 등급 안내</h2>
        <div className="prose">
          <h3>상영시간표 편성과 예매 오픈 시점</h3>
          <p>
            대작 개봉 주간이나 주말 상영시간표는 통상 상영일 기준 2~4일 전(수요일 대작 개봉의 경우 월요일~화요일경)부터 지점별로 순차 오픈됩니다. 특별관(IMAX·돌비 시네마·4DX)은 일반관보다 먼저 예매가 열리는 경우가 많고, 일반관은 상영 전날 오후에 추가 회차가 편성되기도 합니다.
          </p>
          <h3>관람등급별 입장 기준</h3>
          <p>
            <strong>전체관람가</strong>는 모든 연령이 관람할 수 있으며, <strong>12세이상관람가</strong>와 <strong>15세이상관람가</strong>는 해당 연령 미만이더라도 부모 등 보호자를 동반하면 입장이 가능합니다. 반면 <strong>청소년관람불가</strong> 등급 영화는 보호자 동반 여부와 관계없이 만 19세 미만(초·중·고등학생 포함)은 입장할 수 없으며, 입장 시 신분증 확인이 진행됩니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="where">
        <h2 id="where">상영시간표 찾기</h2>
        <p className="section-kicker">상영시간표는 각 영화관 공식 사이트에서 실시간으로 제공됩니다. 브랜드를 선택한 뒤 지점 페이지의 상영시간표 버튼을 이용하세요.</p>
        <ul className="guide-jump-list">
          {meta.brands.map((b) => (
            <li key={b.key}>
              <Link className="guide-jump-link" href={brandPath(b.segment)}>{b.name} {b.count}개 지점</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="note">순위·관객 수는 영화진흥위원회(KOBIS), 감독·출연·포스터는 한국영상자료원(KMDb) 자료를 사용합니다. 집계 시점 이후 변동은 반영되지 않습니다.</div>
      </section>
    </div>
  );
}
