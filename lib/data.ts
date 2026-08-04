import branchesJson from '@/data/branches.json';
import pricesJson from '@/data/prices.json';
import metaJson from '@/data/meta.json';
import type { Branch, BrandKey, Meta, PriceRow } from './types';

export const branches = branchesJson as Branch[];
export const prices = pricesJson as Record<string, PriceRow[]>;
export const meta = metaJson as Meta;

export const BRAND_KEYS: BrandKey[] = ['cgv', 'lotte', 'megabox'];

/** URL 조각(cgv / 롯데시네마 / 메가박스) → 브랜드 키 */
const SEGMENT_TO_BRAND = new Map<string, BrandKey>(
  meta.brands.map((b) => [b.segment, b.key]),
);

export function brandBySegment(segment: string): BrandKey | null {
  return SEGMENT_TO_BRAND.get(decodeURIComponent(segment)) ?? null;
}

export function brandMeta(key: BrandKey) {
  const found = meta.brands.find((b) => b.key === key);
  if (!found) throw new Error(`알 수 없는 브랜드: ${key}`);
  return found;
}

export function branchesOfBrand(key: BrandKey): Branch[] {
  return branches.filter((b) => b.brand === key);
}

/** 브랜드가 지점을 가진 시도만, 정해진 순서로 반환 */
export function sidosOfBrand(key: BrandKey): string[] {
  const owned = new Set(branchesOfBrand(key).map((b) => b.sido));
  return meta.sidoOrder.filter((sido) => owned.has(sido));
}

export function branchesOfBrandSido(key: BrandKey, sido: string): Branch[] {
  return branchesOfBrand(key)
    .filter((b) => b.sido === sido)
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export function findBranch(key: BrandKey, sido: string, slug: string): Branch | null {
  return (
    branches.find((b) => b.brand === key && b.sido === sido && b.slug === slug) ?? null
  );
}

const PAGE_SLUG_TO_BRANCH = new Map<string, Branch>(branches.map((b) => [b.pageSlug, b]));

/** 최상위 URL 슬러그(예: 서울강남-cgv)로 지점을 찾는다 */
export function findBranchByPageSlug(pageSlug: string): Branch | null {
  return PAGE_SLUG_TO_BRANCH.get(decodeURIComponent(pageSlug)) ?? null;
}

export function pricesOf(branchId: string): PriceRow[] {
  return prices[branchId] ?? [];
}

/**
 * 실제 교통·주차·요금 정보를 채워서 "준비 중" 대신 보여줄 지점인지.
 * 서울→경기→인천 순으로 지역을 넓혀오다 전국 425곳을 모두 공개해서
 * 지금은 항상 true다. 개별 항목(교통·주차·요금)이 원본부터 없는 지점은
 * 각 섹션에서 "확인하지 못했습니다" 안내로 처리하므로 여기서 거르지 않는다.
 *
 * 색인 여부(robots)·sitemap 포함 여부도 이 값을 따르므로, 앞으로 특정
 * 지점을 다시 비공개로 돌릴 일이 생기면 여기 한 곳만 고치면 된다.
 */
export function hasFilledContent(_branch: Branch): boolean {
  return true;
}

/* ------------------------------------------------------------------ *
 * URL 만들기
 * 한글이 들어가므로 링크는 항상 이 함수로만 만든다.
 * 직접 문자열을 조합하면 인코딩 형태가 섞여 중복 URL이 생길 수 있다. (기획서 6.2)
 * ------------------------------------------------------------------ */
export function brandPath(segment: string): string {
  return `/${encodeURIComponent(segment)}/`;
}

export function sidoPath(segment: string, sido: string): string {
  return `/${encodeURIComponent(segment)}/${encodeURIComponent(sido)}/`;
}

/** 지점 상세 페이지는 사이트 최상위에 평탄화된 URL을 쓴다: /{시도}{지점명}-{브랜드}/ */
export function branchPath(branch: Branch): string {
  return `/${encodeURIComponent(branch.pageSlug)}/`;
}
