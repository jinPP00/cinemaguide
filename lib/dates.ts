import { meta } from './data';

/**
 * lastmod/dateModified를 페이지 종류별로 다르게 매기는 단일 계산 지점.
 * sitemap.ts와 각 page.tsx의 JSON-LD(webPageJsonLd)가 반드시 같은 값을 써야
 * 신호가 일관되므로, 계산 로직을 여기 한 곳에 두고 양쪽에서 가져다 쓴다.
 *
 * - 지점 페이지: 실제로 지점 데이터를 크롤·확인한 시점(checkedAt)을 쓴다.
 *   지금은 전 지점이 같은 날짜지만, 이후 지점별로 재크롤해 checkedAt이
 *   갈라지면 그 지점만 자동으로 최신 날짜를 갖는 구조다.
 *
 *   ⚠️ 박스오피스 순위(매주 자동 갱신)는 여기 안 쓴다 — 처음엔 "페이지 내용이
 *   실제로 바뀌니까"라는 이유로 넣었었는데, 그러면 425개 지점 페이지의
 *   lastmod가 매주 정확히 같은 날짜로 한꺼번에 바뀐다. Google 공식 가이드가
 *   경고하는 패턴이 정확히 이거다("사이트맵 lastmod를 그냥 오늘 날짜로 전부
 *   도장 찍듯이 바꾸지 마라") — 전 URL이 동시에 같은 값으로 바뀌면 실제 콘텐츠
 *   변경이 아니라 기계적으로 찍은 것처럼 보여서, 최악의 경우 사이트 전체의
 *   lastmod 신호가 무시당할 수 있다. 게다가 박스오피스는 지점 고유 정보가
 *   아니라 전 지점에 동일하게 붙는 공용 위젯이라 "이 페이지가 바뀌었다"는
 *   근거로 쓰기에도 부적절하다. checkedAt처럼 실제로 개별 검증된 값만 쓴다.
 * - 브랜드 허브·시도 페이지: 지점 목록·집계 수치뿐이라 데이터 재생성
 *   시점(meta.generatedAt)을 그대로 쓴다.
 */
export const dataGeneratedAt = new Date(meta.generatedAt);

export function branchLastModified(checkedAt: string): Date {
  return new Date(checkedAt);
}
