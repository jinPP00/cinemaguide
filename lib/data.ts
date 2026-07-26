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

export function pricesOf(branchId: string): PriceRow[] {
  return prices[branchId] ?? [];
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

export function branchPath(branch: Branch): string {
  return `/${encodeURIComponent(branch.brandSegment)}/${encodeURIComponent(
    branch.sido,
  )}/${encodeURIComponent(branch.slug)}/`;
}
