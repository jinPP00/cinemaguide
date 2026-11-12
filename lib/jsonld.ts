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
 * WebPage 구조화 데이터 — dateModified 및 SpeakableSpecification 신호 전용.
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
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.lead', '.guide-lead', '.section-kicker'],
    },
  };
}

/**
 * HowTo 구조화 데이터 — 영화관 지점·관람료·주차·상영시간표 확인 절차 안내용.
 */
export function howToJsonLd(
  name: string,
  description: string,
  steps: { name: string; text: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * FAQPage 구조화 데이터. 화면에 보이는 질문·답과 글자까지 같아야 하므로
 * app/FaqList.tsx가 화면 목록과 이 객체를 같은 배열로 함께 만든다.
 */
export function faqPageJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** 여러 JSON-LD 객체를 <script> 하나에 배열로 담아 출력할 때 쓴다. */
export function jsonLdScript(...objects: object[]) {
  return { __html: JSON.stringify(objects.length === 1 ? objects[0] : objects) };
}
