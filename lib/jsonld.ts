import { SITE } from './site';

/**
 * 검색엔진·AI가 페이지 구조를 이해하도록 붙이는 구조화 데이터 헬퍼.
 *
 * 빵부스러기는 화면에는 있었지만(nav.crumbs) 구조화 데이터가 없어서 검색결과에
 * 경로가 표시되지 않았다. 화면에 보이는 경로와 "같은 순서·같은 이름"으로 넣어야
 * 하므로, 각 페이지에서 화면과 이 함수에 같은 배열을 넘겨 쓰는 것을 원칙으로 한다.
 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = SITE.url.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

/**
 * WebPage 구조화 데이터 — dateModified 신호 전용.
 *
 * MovieTheater(schema.org LocalBusiness 계열)에는 dateModified가 표준 속성으로
 * 없어서, "이 URL이 실제로 언제 바뀌었는지"를 별도 WebPage 객체로 붙인다.
 * sitemap.xml의 lastmod와 반드시 같은 값을 넘겨써야 신호가 일관된다
 * (lib/data.ts나 각 page.tsx에서 sitemap과 동일한 날짜 계산을 재사용할 것).
 */
export function webPageJsonLd(path: string, dateModified: string) {
  const base = SITE.url.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${base}${path}`,
    dateModified,
  };
}

/** 여러 JSON-LD 객체를 <script> 하나에 배열로 담아 출력할 때 쓴다. */
export function jsonLdScript(...objects: object[]) {
  return { __html: JSON.stringify(objects.length === 1 ? objects[0] : objects) };
}
