'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// 클라이언트 컴포넌트이므로 '@/lib/data'가 아니라 '@/lib/paths'에서 가져온다 —
// data.ts를 import하면 branches.json·prices.json 전체가 클라이언트 번들에
// 딸려 들어간다(lib/paths.ts 주석 참고).
import { brandPath } from '@/lib/paths';
import { brandThemeVars } from '@/lib/colors';
import type { BrandKey } from '@/lib/types';
import type { CSSProperties } from 'react';

/**
 * 지금 보고 있는 페이지가 어느 브랜드에 속하는지는 정적 export 사이트라
 * 서버 컴포넌트(레이아웃)에서 알 수 없다 — usePathname()으로 클라이언트에서
 * 판단해서 상단바의 해당 브랜드 링크만 강조한다.
 */
export default function NavLinks({
  brands,
}: {
  brands: { key: BrandKey; name: string; segment: string }[];
}) {
  const pathname = usePathname() ?? '';
  const decoded = decodeURIComponent(pathname);

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
    </nav>
  );
}
