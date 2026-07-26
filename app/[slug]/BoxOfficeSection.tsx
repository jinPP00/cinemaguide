'use client';

import { useEffect, useState } from 'react';
import type { BoxOffice } from '@/lib/types';

/**
 * 박스오피스 순위는 정적 HTML에 굽지 않고 배포 후에도 갱신할 수 있도록
 * /boxoffice.json을 브라우저에서 따로 불러온다. 이렇게 하면 순위가 바뀔 때
 * 이 파일 하나만 교체하면 되고, 425개 지점 페이지를 다시 빌드·배포할 필요가 없다.
 */
export default function BoxOfficeSection() {
  const [data, setData] = useState<BoxOffice | null>(null);
  const [failed, setFailed] = useState(false);

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
      {!data ? (
        <div className="boxoffice-skeleton" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="bo-skel" key={i} />
          ))}
        </div>
      ) : (
        <ol className="boxoffice-list">
          {data.movies.map((m) => (
            <li className="bo-item" key={m.movieCd}>
              <span className="bo-rank">{m.rank}</span>
              <span className="bo-name">{m.name}</span>
              <span className="bo-audience">누적 {m.audienceTotal.toLocaleString()}명</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
