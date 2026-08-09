'use client';

import { useState } from 'react';
import type { BoxOffice, BoxOfficeMovie } from '@/lib/types';

/**
 * 박스오피스 순위. 데이터는 서버(빌드 시점)에서 넘겨받아 정적 HTML에 그대로
 * 구워진다 — 접기/펼치기 상호작용 때문에만 클라이언트 컴포넌트다.
 *
 * 예전에는 브라우저에서 /boxoffice.json을 fetch 했다. "JSON 하나만 갈아끼우면
 * 425개 페이지를 다시 굽지 않아도 된다"는 이유였는데, 실제 운영에서는 갱신
 * 워크플로(.github/workflows/boxoffice.yml)가 이 JSON을 저장소에 커밋·푸시하고
 * 그 푸시로 Cloudflare가 어차피 전체를 다시 빌드한다. 재빌드를 피한다는 이점이
 * 이미 사라진 상태였고, 대신 아래 손해만 남아 있었다:
 *   - GPTBot·ClaudeBot 같은 LLM 크롤러는 자바스크립트를 실행하지 않아서 이
 *     섹션이 통째로 빈 채로 수집된다(AI 검색 대응에 치명적)
 *   - 검색엔진도 렌더링 큐를 거쳐야 내용을 본다
 *   - 로딩 스켈레톤 → 실제 목록 교체 과정에서 레이아웃이 밀린다(CLS)
 * 그래서 서버 렌더링으로 되돌렸다.
 *
 * ⚠️ "이러면 425페이지가 매주 한꺼번에 바뀌어서 SEO에 불리하지 않냐"는 질문이
 * 재차 나왔던 부분(2026-08-09) — 결론: 문제 없음, 유지하기로 확정함.
 *   - 뉴스 사이트 "실시간 인기기사", 쇼핑몰 "지금 뜨는 상품"과 똑같은 패턴.
 *     같은 위젯이 수많은 페이지에서 동시에 갱신되는 건 흔하고 정상이다.
 *     Google은 "페이지 간 겹침"이 아니라 "이 페이지의 핵심 콘텐츠가 뭔가"를
 *     본다 — 지점 페이지 핵심(주소·교통·주차·요금)은 지점마다 다 다르다.
 *   - 이 섹션은 페이지 전체 텍스트의 약 11%뿐이다(측정 확인, 2026-08-09
 *     서울강남-cgv 기준). 위험 수위(50%+)에 한참 못 미친다.
 *   - 진짜 위험한 건 "거짓 신선도 신호"였는데, 그건 이미 별도로 막혀 있다 —
 *     dateModified·sitemap lastmod는 lib/dates.ts에서 박스오피스를 아예
 *     참고하지 않고 checkedAt만 쓴다(주석 참고). 즉 "콘텐츠는 실제로 바뀌지만
 *     메타데이터로 거짓 광고는 안 하는" 상태라 안전하다.
 *   같은 걱정으로 다시 JS fetch로 되돌리지 말 것 — 위 세 가지 근거로 이미 검토·
 *   기각됐다.
 */
export default function BoxOfficeSection({ data }: { data: BoxOffice | null }) {
  const [openCd, setOpenCd] = useState<string | null>(null);

  if (!data || data.movies.length === 0) return null;

  return (
    <section className="section" aria-labelledby="boxoffice">
      <h2 id="boxoffice">현재 상영중인 영화 순위</h2>
      <p className="card-sub" style={{ marginTop: 4 }}>영화를 누르면 상세정보를 볼 수 있습니다</p>
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
                  <span className={`bo-rank${m.rank === 1 ? ' bo-rank--top' : ''}`}>{m.rank}</span>
                  {m.posterUrl ? (
                    // 영화 포스터는 장식이 아니라 내용을 담은 이미지다. alt를 비우면
                    // 스크린리더·이미지 검색 양쪽에서 무엇인지 알 수 없다.
                    // width/height를 박아둬야 이미지 로드 전후로 줄이 밀리지 않는다(CLS).
                    <img
                      className="bo-poster"
                      src={toHttps(m.posterUrl)}
                      alt={`${m.name} 포스터`}
                      width={34}
                      height={48}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="bo-poster bo-poster-empty" aria-hidden="true" />
                  )}
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
      <p className="bo-credit">영화 정보 제공: 영화진흥위원회(KOBIS)·한국영상자료원(KMDb)</p>
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

  if (rows.length === 0 && !m.posterUrl) {
    return <div className="bo-detail bo-detail-empty">상세정보를 찾을 수 없습니다</div>;
  }

  return (
    <div className="bo-detail">
      {m.posterUrl && (
        <img
          className="bo-poster-lg"
          src={toHttps(m.posterUrl)}
          alt={`${m.name} 포스터`}
          loading="lazy"
          decoding="async"
        />
      )}
      {rows.length > 0 ? (
        <dl className="bo-detail-rows">
          {rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="bo-detail-empty" style={{ padding: 0 }}>상세정보를 찾을 수 없습니다</p>
      )}
    </div>
  );
}

/**
 * KMDb가 내려주는 포스터 주소는 http:// 로 시작한다. https 페이지에서 그대로
 * 쓰면 혼합 콘텐츠(mixed content)라 브라우저 콘솔에 지점 페이지마다 10건씩
 * 경고가 뜬다. 크롬은 https로 자동 승격해 지금은 보이긴 하지만 정상 상태는
 * 아니고, 승격을 지원하지 않는 환경에서는 이미지가 아예 차단된다.
 * 같은 호스트가 https도 제공하는 것을 확인했으므로 올려서 쓴다.
 */
function toHttps(url: string): string {
  return url.replace(/^http:\/\//, 'https://');
}
