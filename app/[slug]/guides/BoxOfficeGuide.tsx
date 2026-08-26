import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, brandPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';
import type { BoxOffice } from '@/lib/types';
import BoxOfficeSection from '../BoxOfficeSection';
import boxofficeData from '../../../public/boxoffice.json';

const boxoffice = boxofficeData as BoxOffice;
const PATH = guidePath(GUIDES.boxoffice);

export const boxOfficeMetadata: Metadata = {
  title: '영화순위 — 박스오피스 순위와 영화 정보',
  description:
    '영화진흥위원회(KOBIS) 집계 기준 박스오피스 순위와 누적 관객 수, 감독, 출연, 러닝타임, 관람등급을 확인할 수 있습니다.',
  alternates: { canonical: PATH },
};

function formatTargetDate(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  return `${y}년 ${m}월 ${d}일`;
}

export default function BoxOfficePage() {
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
          webPageJsonLd(PATH, dataGeneratedAt.toISOString()),
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
      </ul>

      <BoxOfficeSection data={boxoffice} />

      <section className="section" aria-labelledby="how-to-read">
        <h2 id="how-to-read">순위 기준</h2>
        <p className="guide-copy">박스오피스 순위는 집계일 하루 동안의 관객 수로 정해집니다. 누적 관객 수는 개봉 이후 전체 관객 수이므로 순위와 순서가 다를 수 있습니다. 영화명을 누르면 감독·출연·장르·관람등급·러닝타임을 확인할 수 있습니다.</p>
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
