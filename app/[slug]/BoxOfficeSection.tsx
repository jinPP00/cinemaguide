'use client';

import { useEffect, useState } from 'react';
import type { BoxOffice, BoxOfficeMovie } from '@/lib/types';

/**
 * 박스오피스 순위는 정적 HTML에 굽지 않고 배포 후에도 갱신할 수 있도록
 * /boxoffice.json을 브라우저에서 따로 불러온다. 이렇게 하면 순위가 바뀔 때
 * 이 파일 하나만 교체하면 되고, 425개 지점 페이지를 다시 빌드·배포할 필요가 없다.
 * 감독·배우 등 상세정보도 이 JSON에 이미 들어있다(fetch-boxoffice.mjs가 미리
 * 받아둠) — 클릭 시 추가 API 호출 없이 바로 펼쳐 보여준다.
 */
export default function BoxOfficeSection() {
  const [data, setData] = useState<BoxOffice | null>(null);
  const [failed, setFailed] = useState(false);
  const [openCd, setOpenCd] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/boxoffice.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('boxoffice fetch failed');
        return res.json();
      })
      .then((json: BoxOffice) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  return (
    <section className="section" aria-labelledby="boxoffice">
      <h2 id="boxoffice">현재 상영중인 영화 순위</h2>
      <p className="card-sub" style={{ marginTop: 4 }}>영화를 누르면 상세정보를 볼 수 있습니다</p>
      {!data ? (
        <div className="boxoffice-skeleton" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="bo-skel" key={i} />
          ))}
        </div>
      ) : (
        <ol className="boxoffice-list">
          {data.movies.map((m) => {
            const isOpen = openCd === m.movieCd;
            return (
              <li className="bo-item-wrap" key={m.movieCd}>
                <button
                  type="button"
                  className="bo-item"
                  aria-expanded={isOpen}
                  onClick={() => setOpenCd(isOpen ? null : m.movieCd)}
                >
                  <span className="bo-rank">{m.rank}</span>
                  <span className="bo-name">{m.name}</span>
                  <span className="bo-audience">누적 {m.audienceTotal.toLocaleString()}명</span>
                  <svg
                    className={`bo-chevron${isOpen ? ' is-open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && <MovieDetail movie={m} />}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function MovieDetail({ movie: m }: { movie: BoxOfficeMovie }) {
  const rows: { label: string; value: string }[] = [];
  if (m.directors?.length) rows.push({ label: '감독', value: m.directors.join(', ') });
  if (m.actors?.length) rows.push({ label: '출연', value: m.actors.join(', ') });
  if (m.genres?.length) rows.push({ label: '장르', value: m.genres.join(', ') });
  if (m.watchGrade) rows.push({ label: '관람등급', value: m.watchGrade });
  if (m.runtime) rows.push({ label: '러닝타임', value: `${m.runtime}분` });
  if (m.nations?.length) rows.push({ label: '제작국가', value: m.nations.join(', ') });

  if (rows.length === 0) {
    return <div className="bo-detail bo-detail-empty">상세정보를 찾을 수 없습니다</div>;
  }

  return (
    <dl className="bo-detail">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
