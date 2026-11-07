import { meta } from './data';
import boxoffice from '../public/boxoffice.json';

/**
 * lastmod/dateModified를 페이지 종류별로 다르게 매기는 단일 계산 지점.
 * sitemap.ts와 각 page.tsx의 JSON-LD(webPageJsonLd)가 반드시 같은 값을 써야
 * 신호가 일관되므로, 계산 로직을 여기 한 곳에 두고 양쪽에서 가져다 쓴다.
 *
 * - 지점 페이지: 원본 확인일(checkedAt)과 지점 페이지 본문·구조 생성일(meta.generatedAt)
 *   중 더 최신 시점을 쓴다(화면의 원본 확인일 표시는 branch.checkedAt 그대로 유지).
 *   checkedAt(2026-07-23)만 쓰면 8월 이후 지점 페이지 본문·계산표·FAQ 스키마가
 *   대폭 보강됐는데도 sitemap lastmod가 크롤링 시점(8월 초중순)보다 과거에 머물러
 *   검색엔진이 재크롤링을 건너뛰는 문제가 발생한다.
 * - 브랜드 허브·시도 페이지: 지점 목록·집계 수치뿐이라 데이터 재생성
 *   시점(meta.generatedAt)을 그대로 쓴다.
 */
export const dataGeneratedAt = new Date(meta.generatedAt);

// 영화 순위의 실제 저장 시점. 지점 확인일에는 이 값을 섞지 않는다.
export const boxOfficeLastModified = new Date(boxoffice.fetchedAt);

export function branchLastModified(checkedAt: string): Date {
  const checked = new Date(checkedAt);
  return checked > dataGeneratedAt ? checked : dataGeneratedAt;
}
