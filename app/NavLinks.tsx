'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brandPath, guidePath, GUIDES } from '@/lib/paths';
import { brandThemeVars } from '@/lib/colors';
import type { BrandKey } from '@/lib/types';
import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * 브랜드 메뉴와 핵심 안내 페이지(관람료 비교·특별관·주차·할인·영화순위)를 상단에서 바로 이동할 수 있게 한다.
 */
export default function NavLinks({
  brands,
}: {
  brands: { key: BrandKey; name: string; segment: string }[];
}) {
  const pathname = usePathname() ?? '';
  const decoded = decodeURIComponent(pathname);
  const navRef = useRef<HTMLElement>(null);

  // 모바일에서는 메뉴가 한 줄 가로 스크롤이라, 현재 메뉴가 화면 밖에 있으면 보이는 곳으로 옮긴다
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const offset = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    nav.scrollLeft += offset - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);
  const isGuide = (slug: string) => {
    const p = decodeURIComponent(guidePath(slug as (typeof GUIDES)[keyof typeof GUIDES]));
    return decoded === p || decoded === p.replace(/\/$/, '');
  };

  return (
    <nav ref={navRef} className="nav" aria-label="주요 메뉴">
      {brands.map((b) => {
        const isActive =
          decoded.startsWith(`/${b.segment}/`) ||
          decoded === `/${b.segment}` ||
          decoded.endsWith(`-${b.segment}/`);
        const themeVars = isActive ? (brandThemeVars(b.key) as CSSProperties) : undefined;
        return (
          <Link
            key={b.key}
            href={brandPath(b.segment)}
            aria-current={isActive ? 'page' : undefined}
            style={themeVars}
          >
            {b.name}
          </Link>
        );
      })}
      <span className="nav-sep" aria-hidden="true" />
      <Link href={guidePath(GUIDES.fares)} aria-current={isGuide(GUIDES.fares) ? 'page' : undefined}>
        관람료 비교
      </Link>
      <Link href={guidePath(GUIDES.screens)} aria-current={isGuide(GUIDES.screens) ? 'page' : undefined}>
        특별관
      </Link>
      <Link href={guidePath(GUIDES.parking)} aria-current={isGuide(GUIDES.parking) ? 'page' : undefined}>
        주차
      </Link>
      <Link href={guidePath(GUIDES.discounts)} aria-current={isGuide(GUIDES.discounts) ? 'page' : undefined}>
        할인·우대
      </Link>
      <Link href={guidePath(GUIDES.boxoffice)} aria-current={isGuide(GUIDES.boxoffice) ? 'page' : undefined}>
        영화 순위
      </Link>
    </nav>
  );
}
