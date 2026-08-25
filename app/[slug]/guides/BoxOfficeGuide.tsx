import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, brandPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';
import type { BoxOffice } from '@/lib/types';
import BoxOfficeSection from '../BoxOfficeSection';
import boxofficeData from '../../../public/boxoffice.json';
import { withJosa } from '@/lib/josa';

const boxoffice = boxofficeData as BoxOffice;

const PATH = guidePath(GUIDES.boxoffice);

export const boxOfficeMetadata: Metadata = {
  title: '박스오피스 순위 — 지금 상영 중인 영화',
  description:
    '영화진흥위원회(KOBIS) 집계 기준 박스오피스 순위와 감독·출연·러닝타임·관람등급 정보입니다. 순위가 무엇을 기준으로 매겨지는지도 함께 정리했습니다.',
  alternates: { canonical: PATH },
};

/** 20260823 → 2026년 8월 23일 */
function formatTargetDate(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  return `${y}년 ${m}월 ${d}일`;
}

export default function BoxOfficePage() {
  const movies = boxoffice.movies;

  // 순위와 누적 관객 수가 어긋나는 지점을 찾는다. "왜 1위인데 누적이 더 적지"는
  // 실제로 자주 나오는 의문이고, 답은 순위 기준이 누적이 아니라 그날 관객
  // 수라는 것이다. 특정 영화 이름을 본문에 박아두면 매주 갱신될 때 틀린 말이
  // 되므로, 지금 데이터에서 실제로 그런 사례를 찾아 문장을 만든다.
  const inversion = movies.find(
    (m) => movies.some((other) => other.rank > m.rank && other.audienceTotal > m.audienceTotal),
  );
  const inverted =
    inversion &&
    movies
      .filter((o) => o.rank > inversion.rank && o.audienceTotal > inversion.audienceTotal)
      .sort((a, b) => a.rank - b.rank)[0];

  const longest = [...movies].sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0))[0];
  // 등급이 데이터 등장 순서라 "15세·12세·전체"처럼 뒤죽박죽 나온다 — 나이순으로
  // 다시 세운다. 숫자가 없는 "전체관람가"는 0, "청소년관람불가"는 맨 뒤.
  const gradeRank = (g: string) => (g.includes('청소년') ? 99 : Number(g.match(/[0-9]+/)?.[0] ?? 0));
  const grades = ([...new Set(movies.map((m) => m.watchGrade).filter(Boolean))] as string[]).sort(
    (a, b) => gradeRank(a) - gradeRank(b),
  );

  const crumbs = [
    { name: '홈', path: '/' },
    { name: '박스오피스', path: PATH },
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
          <li>박스오피스</li>
        </ol>
      </nav>

      <h1>박스오피스 순위</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        영화진흥위원회 영화관입장권 통합전산망(KOBIS)이 집계한 {formatTargetDate(boxoffice.targetDate)}{' '}
        기준 순위입니다. 매주 월요일 오전에 다시 받아옵니다.
      </p>

      <BoxOfficeSection data={boxoffice} />

      <section className="section" aria-labelledby="how-to-read">
        <h2 id="how-to-read">이 순위를 읽는 법</h2>
        <div className="prose" style={{ marginTop: 12 }}>
          <p>
            순위는 <strong>집계일 하루 동안 극장에 들어온 관객 수</strong>로 매깁니다. 개봉
            이후 누적 관객 수와는 다른 기준이라, 오래 걸린 영화가 누적으로는 앞서면서도
            순위는 뒤에 오는 일이 생깁니다.
          </p>
          {inversion && inverted && (
            <p>
              지금 목록에서도 그렇습니다. {inversion.rank}위 {inversion.name}의 누적 관객은{' '}
              {inversion.audienceTotal.toLocaleString()}명인데, {inverted.rank}위{' '}
              {withJosa(inverted.name, '은')} {inverted.audienceTotal.toLocaleString()}명으로 더 많습니다.
              지금 관객이 몰리는 영화를 보려면 순위를, 사람들이 많이 본 영화를 찾으려면
              누적 관객 수를 보면 됩니다.
            </p>
          )}
          {/* 상영 시각·막차 시각은 우리가 가진 데이터가 아니다. 목록에서 실제로
              읽어낼 수 있는 것만 적는다. */}
          <p>
            목록의 영화를 누르면 감독·출연·장르·관람등급·러닝타임이 펼쳐집니다. 지금 목록에서
            가장 긴 작품은 {withJosa(longest.name, '으로')} {longest.runtime}분
            {grades.length > 0 && (
              <>, 관람등급은 {withJosa(grades.join(', '), '이')} 섞여 있습니다</>
            )}.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="where">
        <h2 id="where">어디서 볼 수 있나</h2>
        <p className="card-sub" style={{ marginTop: 4 }}>
          이 사이트는 상영시간표를 직접 제공하지 않습니다. 브랜드를 고르면 지역별 지점
          목록으로 이동하고, 각 지점 페이지에서 공식 상영시간표로 바로 넘어갈 수 있습니다.
        </p>
        <ul className="chip-list" style={{ marginTop: 14 }}>
          {meta.brands.map((b) => (
            <li key={b.key}>
              <Link className="chip" href={brandPath(b.segment)}>
                {b.name} {b.count}개 지점
              </Link>
            </li>
          ))}
        </ul>
        <p className="card-sub" style={{ marginTop: 16 }}>
          같은 영화라도 상영관 종류에 따라 요금이 달라집니다.{' '}
          <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>와{' '}
          <Link href={guidePath(GUIDES.fares)}>관람료 비교</Link>에 종류별 추가요금을
          정리해두었습니다.
        </p>
      </section>

      <section className="section">
        <div className="note">
          순위·관객 수는 영화진흥위원회(KOBIS), 감독·출연·포스터는 한국영상자료원(KMDb)
          자료입니다. 집계 시점 이후의 변동은 반영되지 않습니다.
        </div>
      </section>
    </div>
  );
}
