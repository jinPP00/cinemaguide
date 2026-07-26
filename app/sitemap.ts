import type { MetadataRoute } from 'next';
import { meta, sidosOfBrand, brandPath, sidoPath } from '@/lib/data';
import { SITE } from '@/lib/site';

/**
 * sitemap에는 "색인 대상 canonical URL"만 넣는다. (가이드 5.7 / 기획서 10.2)
 *
 * 1단계에서 지점 상세 425개는 아직 내용이 없어 noindex이므로 여기 포함하지 않는다.
 * robots.txt로 차단하지는 않는다 — 검색엔진이 페이지를 읽어야 noindex를 인식할 수 있기 때문이다.
 * 2단계에서 내용을 채운 뒤 지점 URL을 여기에 추가하고 noindex를 제거한다.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, '');
  const lastModified = new Date(meta.generatedAt);

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
  ];

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

  return entries;
}
