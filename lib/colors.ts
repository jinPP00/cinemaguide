import type { BrandKey } from './types';

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
