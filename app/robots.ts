import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * 지점 상세 페이지는 robots.txt로 차단하지 않는다.
 * 차단하면 크롤러가 페이지를 읽지 못해 meta robots의 noindex를 확인할 수 없다. (가이드 5.7)
 * 색인 제외는 각 지점 페이지의 noindex 메타로 처리한다.
 * Cloudflare Managed robots.txt가 기본 삽입되더라도 주요 AI 검색·인용 봇의
 * Allow: / 규칙을 명시해 GEO(생성형 엔진 최적화) 수집을 허용한다.
 */
export const dynamic = 'force-static';

const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, '');
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
