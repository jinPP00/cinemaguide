import { meta } from './data';
import type { BrandKey } from './types';

/**
 * 지역 버튼과 브랜드 아이콘 칩에 쓰는 색.
 *
 * 카드 상단에 브랜드색 띠를 두르는 방식은 쓰지 않는다(디자인 검토에서 제외됨).
 * 대신 작은 아이콘 칩·버튼 배경에만 옅은 색을 쓰고, 텍스트는 같은 색 계열의 진한 톤을 쓴다.
 */
const PALETTE: { bg: string; fg: string }[] = [
  { bg: '#eeedfe', fg: '#3c3489' },
  { bg: '#e1f5ee', fg: '#085041' },
  { bg: '#faece7', fg: '#712b13' },
  { bg: '#fbeaf0', fg: '#72243e' },
  { bg: '#e6f1fb', fg: '#0c447c' },
  { bg: '#eaf3de', fg: '#27500a' },
  { bg: '#faeeda', fg: '#633806' },
  { bg: '#fcebeb', fg: '#791f1f' },
  { bg: '#f1efe8', fg: '#444441' },
];

/** 시도마다 고정된 색을 반환한다 (표시 순서 기준이라 항상 같은 지역은 같은 색). */
export function sidoColor(sido: string): { bg: string; fg: string } {
  const index = meta.sidoOrder.indexOf(sido);
  return PALETTE[(index < 0 ? 0 : index) % PALETTE.length];
}

/** 브랜드 카드 아이콘 칩 색. 실제 브랜드 컬러 대신 서로 구분되는 절제된 톤을 쓴다. */
export const BRAND_ICON_COLOR: Record<BrandKey, { bg: string; fg: string }> = {
  cgv: { bg: '#fcebeb', fg: '#791f1f' },
  lotte: { bg: '#faece7', fg: '#712b13' },
  megabox: { bg: '#e6f1fb', fg: '#0c447c' },
};

/** 홈 브랜드 카드의 로고체 표기. 한글 브랜드명은 표시용 글꼴(Oswald)에
 * 한글 글리프가 없어 그대로 쓰면 폰트가 깨지므로 로마자 표기를 따로 둔다. */
export const BRAND_WORDMARK: Record<BrandKey, string> = {
  cgv: 'CGV',
  lotte: 'LOTTE CINEMA',
  megabox: 'MEGABOX',
};

/**
 * 브랜드 허브·지역 목록·지점 상세 페이지에 공통으로 입히는 브랜드 색.
 * 루트 요소에 이 값을 CSS 커스텀 속성으로 걸어두면(--brand-bg/--brand-fg)
 * globals.css의 .brand-themed 규칙들이 알아서 그 브랜드 색을 쓴다.
 */
export function brandThemeVars(key: BrandKey): Record<string, string> {
  const c = BRAND_ICON_COLOR[key];
  return { '--brand-bg': c.bg, '--brand-fg': c.fg };
}
