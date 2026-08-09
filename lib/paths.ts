/**
 * URL 경로 생성 헬퍼 — 순수 문자열 함수만 두고 데이터는 일절 import 하지 않는다.
 *
 * 이 파일이 lib/data.ts에서 분리된 이유: NavLinks 같은 클라이언트 컴포넌트가
 * brandPath() 하나 쓰려고 '@/lib/data'를 import하면, data.ts가 최상단에서
 * branches.json·prices.json을 import하기 때문에 지점 데이터 전체가 클라이언트
 * JS 번들로 끌려들어간다(실측 1.4MB짜리 청크가 전 페이지에 로드되고 있었다).
 * 경로 함수는 데이터가 필요 없으므로 여기로 떼어내 그 연결을 끊는다.
 *
 * 클라이언트 컴포넌트에서는 반드시 '@/lib/paths'에서 가져다 쓸 것.
 * (lib/data.ts도 이 파일을 재export 하므로 서버 쪽 기존 import는 그대로 동작한다.)
 */

export function brandPath(segment: string): string {
  return `/${encodeURIComponent(segment)}/`;
}

export function sidoPath(segment: string, sido: string): string {
  return `/${encodeURIComponent(segment)}/${encodeURIComponent(sido)}/`;
}

/** 지점 상세 페이지는 사이트 최상위에 평탄화된 URL을 쓴다: /{시도}{지점명}-{브랜드}/ */
export function branchPath(branch: { pageSlug: string }): string {
  return `/${encodeURIComponent(branch.pageSlug)}/`;
}
