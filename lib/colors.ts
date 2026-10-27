import type { BrandKey } from './types';

/** 브랜드 구분색. 공식 브랜드색처럼 보이지 않게 채도를 낮춘 톤으로, 점·밑줄 같은
 * 작은 표시에만 쓴다. */
export const BRAND_ICON_COLOR: Record<BrandKey, { bg: string; fg: string }> = {
  cgv: { bg: '#f7eeee', fg: '#a13a3a' },
  lotte: { bg: '#f8f0ea', fg: '#a8532a' },
  megabox: { bg: '#efeef6', fg: '#4f4790' },
};

/** 홈 브랜드 카드의 로고체 표기. 한글 브랜드명은 표시용 글꼴에
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
