'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brandPath, guidePath, GUIDES } from '@/lib/paths';
import { brandThemeVars } from '@/lib/colors';
import type { BrandKey } from '@/lib/types';
import type { CSSProperties } from 'react';

/**
 * 브랜드 메뉴와 영화순위를 모든 페이지 상단에서 바로 이동할 수 있게 한다.
 * 브랜드 활성 상태는 해당 브랜드 허브·지역·지점 페이지에서 표시하고,
 * 영화순위는 박스오피스 안내 페이지에서만 활성화한다.
 */
export default function NavLinks({
  brands,
}: {
  brands: { key: BrandKey; name: string; segment: string }[];
}) {
  const pathname = usePathname() ?? '';
  const decoded = decodeURIComponent(pathname);
  const boxOfficePath = decodeURIComponent(guidePath(GUIDES.boxoffice));
  const isBoxOffice = decoded === boxOfficePath || decoded === boxOfficePath.replace(/\/$/, '');

  return (
    <nav className="nav" aria-label="주요 메뉴">
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
      <Link href={guidePath(GUIDES.boxoffice)} aria-current={isBoxOffice ? 'page' : undefined}>
        영화순위
      </Link>
    </nav>
  );
}
