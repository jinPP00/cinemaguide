import branchesJson from '@/data/branches.json';
import pricesJson from '@/data/prices.json';
import metaJson from '@/data/meta.json';
import type { Branch, BrandKey, Meta, PriceRow } from './types';
import { normalizeBranchTransit } from './transit-normalize';

// 원본 JSON은 근거 데이터로 그대로 보존하고, 화면에서 읽는 순간에만 교통 문구의
// HTML 엔티티·붙어버린 구분자·노선/정류장 경계를 정리한다.
export const branches = (branchesJson as Branch[]).map(normalizeBranchTransit);
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

/* ------------------------------------------------------------------ *
 * 지점이 어떤 정보를 실제로 갖고 있는지
 * ------------------------------------------------------------------ */

const filled = (value: string | null | undefined) => value != null && value.trim() !== '';

/**
 * 교통 안내가 있는가. 브랜드마다 담기는 필드가 달라 셋 다 봐야 한다.
 *
 * 마지막 조건은 크롤링 경계 오류 보정이다. 지하철 안내가 교통이 아니라 주차
 * 필드에 "■ 지하철 …" 조각으로 섞여 들어온 지점(대전탄방 등)이 있고, 화면에서는
 * 그걸 되찾아 지하철 카드로 보여주고 있다. 여기서 빠뜨리면 실제로는 교통 안내가
 * 멀쩡히 뜨는 페이지를 색인에서 제외하게 된다.
 */
export function hasTransitInfo(branch: Branch): boolean {
  return (
    filled(branch.transit.raw) ||
    filled(branch.transit.subway) ||
    filled(branch.transit.bus) ||
    (branch.parking.raw?.includes('■ 지하철') ?? false)
  );
}

/** 주차 안내가 있는가. CGV는 raw 한 덩어리, 나머지는 항목별로 나뉜다. */
export function hasParkingInfo(branch: Branch): boolean {
  return (
    filled(branch.parking.raw) ||
    filled(branch.parking.guide) ||
    filled(branch.parking.howTo) ||
    filled(branch.parking.fee)
  );
}

export function hasPriceInfo(branch: Branch): boolean {
  return pricesOf(branch.id).length > 0;
}

/**
 * 검색엔진에 색인시킬 지점인지. robots 설정과 sitemap 포함 여부가 모두 이
 * 값을 따르므로, 색인 범위를 조정할 일이 생기면 여기 한 곳만 고치면 된다.
 *
 * 기준은 "화면에 '아직 확인하지 못했습니다'가 뜨는 페이지는 색인하지 않는다"
 * 하나다. 교통·주차·요금 중 하나라도 원본에 없으면 그 자리에 안내문이 나가는데,
 * 그건 이용자에게 정직하게 알리려고 두는 것이지 검색결과로 끌어올 내용은
 * 아니다. 원본 데이터가 채워지면 이 함수를 고치지 않아도 자동으로 색인 대상이
 * 된다.
 *
 * ⚠️ 이 값은 본문 렌더링과는 무관하다. 색인하지 않는 지점도 갖고 있는 정보
 * (주소·요금표·특별관·근처 영화관)는 그대로 다 보여준다 — 링크를 타고 들어온
 * 사람에게까지 내용을 감출 이유는 없다.
 */
export function isIndexable(branch: Branch): boolean {
  return hasTransitInfo(branch) && hasParkingInfo(branch) && hasPriceInfo(branch);
}

/* ------------------------------------------------------------------ *
 * URL 만들기
 * 한글이 들어가므로 링크는 항상 이 함수로만 만든다.
 * 직접 문자열을 조합하면 인코딩 형태가 섞여 중복 URL이 생길 수 있다. (기획서 6.2)
 * ------------------------------------------------------------------ */
// 경로 헬퍼는 lib/paths.ts로 분리했다(클라이언트 번들에 데이터가 딸려가는 것을
// 막기 위해서 — 이유는 그 파일 주석 참고). 서버 쪽 기존 import가 깨지지 않도록
// 여기서 그대로 재export 한다.
export { brandPath, sidoPath, branchPath } from './paths';
