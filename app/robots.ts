import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * 지점 상세 페이지는 robots.txt로 차단하지 않는다.
 * 차단하면 크롤러가 페이지를 읽지 못해 meta robots의 noindex를 확인할 수 없다. (가이드 5.7)
 * 색인 제외는 각 지점 페이지의 noindex 메타로 처리한다.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
  };
}
