import type { MetadataRoute } from 'next';
import { meta, sidosOfBrand, brandPath, sidoPath, branches, branchPath, isIndexable } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { SITE } from '@/lib/site';
import { dataGeneratedAt, branchLastModified } from '@/lib/dates';

/**
 * sitemap에는 "색인 대상 canonical URL"만 넣는다. (가이드 5.7 / 기획서 10.2)
 *
 * 지점 상세는 isIndexable()이 true인 지점만 포함한다 — 교통·주차·요금 중
 * 하나라도 비어 "확인하지 못했습니다"가 나가는 페이지는 그 자체가 noindex라
 * 여기 넣어도 의미가 없다.
 * robots.txt로 차단하지는 않는다 — 검색엔진이 페이지를 읽어야 noindex를 인식할 수 있기 때문이다.
 *
 * lastmod 계산(페이지 종류별로 다르게 매기는 이유·근거)은 lib/dates.ts 참고.
 * 각 page.tsx의 WebPage JSON-LD(dateModified)도 반드시 같은 값을 쓴다.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, '');
  const lastModified = dataGeneratedAt;

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
  ];

  // 안내 페이지 — 3사 데이터를 가로질러 만든 콘텐츠라 지점·브랜드 페이지보다
  // 우선순위를 높게 잡는다. 박스오피스는 주 1회 갱신되므로 changeFrequency도 다르다.
  for (const [path, changeFrequency] of [
    [guidePath(GUIDES.fares), 'monthly'],
    [guidePath(GUIDES.screens), 'monthly'],
    [guidePath(GUIDES.boxoffice), 'weekly'],
  ] as const) {
    entries.push({ url: `${base}${path}`, lastModified, changeFrequency, priority: 0.7 });
  }

  // 소개·문의·정책 페이지 (가이드 5.8 — 일반적으로 색인 가능)
  for (const path of [
    '/about/',
    '/contact/',
    '/privacy/',
    '/terms/',
    '/disclaimer/',
    '/affiliate-disclosure/',
  ]) {
    entries.push({
      url: `${base}${path}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    });
  }

  for (const brand of meta.brands) {
    entries.push({
      url: `${base}${brandPath(brand.segment)}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    });

    for (const sido of sidosOfBrand(brand.key)) {
      entries.push({
        url: `${base}${sidoPath(brand.segment, sido)}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  for (const branch of branches) {
    if (!isIndexable(branch)) continue;
    entries.push({
      url: `${base}${branchPath(branch)}`,
      lastModified: branchLastModified(branch.checkedAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return entries;
}
