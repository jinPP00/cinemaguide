import { meta } from '@/lib/data';
import { brandPath, guidePath, GUIDES } from '@/lib/paths';
import { dataGeneratedAt, boxOfficeLastModified } from '@/lib/dates';
import { SITE } from '@/lib/site';
import { fareComparisonMetadata } from '../[slug]/guides/FareComparison';
import { specialScreensMetadata } from '../[slug]/guides/SpecialScreens';
import { parkingGuideMetadata } from '../[slug]/guides/ParkingGuide';
import { discountGuideMetadata } from '../[slug]/guides/DiscountGuide';
import { boxOfficeMetadata } from '../[slug]/guides/BoxOfficeGuide';
import type { Metadata } from 'next';

/**
 * 네이버 서치어드바이저 RSS 제출용 피드. 지점 425곳을 다 넣지 않고, 내용이 바뀌는
 * 안내 페이지와 브랜드 목록만 넣는다(지점 URL은 sitemap.xml이 맡는다).
 * 날짜는 sitemap의 lastmod와 같은 값을 쓴다.
 */
export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (v: Metadata['title'] | Metadata['description']) => (typeof v === 'string' ? v : '');

export function GET() {
  const base = SITE.url.replace(/\/$/, '');
  const items: { title: string; path: string; description: string; date: Date }[] = [
    { title: text(fareComparisonMetadata.title), path: guidePath(GUIDES.fares), description: text(fareComparisonMetadata.description), date: dataGeneratedAt },
    { title: text(specialScreensMetadata.title), path: guidePath(GUIDES.screens), description: text(specialScreensMetadata.description), date: dataGeneratedAt },
    { title: text(parkingGuideMetadata.title), path: guidePath(GUIDES.parking), description: text(parkingGuideMetadata.description), date: dataGeneratedAt },
    { title: text(discountGuideMetadata.title), path: guidePath(GUIDES.discounts), description: text(discountGuideMetadata.description), date: dataGeneratedAt },
    { title: text(boxOfficeMetadata.title), path: guidePath(GUIDES.boxoffice), description: text(boxOfficeMetadata.description), date: boxOfficeLastModified },
    ...meta.brands.map((b) => ({
      title: `${b.name} 상영시간표·전국 지점 안내`,
      path: brandPath(b.segment),
      description: `${b.name} ${b.count}개 지점의 주소, 가는 길, 주차, 관람료와 공식 상영시간표 링크.`,
      date: dataGeneratedAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const latest = items[0].date;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${base}/</link>
    <description>${esc(SITE.description)}</description>
    <language>ko</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${base}${i.path}</link>
      <guid isPermaLink="true">${base}${i.path}</guid>
      <description>${esc(i.description)}</description>
      <pubDate>${i.date.toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
