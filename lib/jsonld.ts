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
 * FAQPage 구조화 데이터.
 *
 * 주의: 구글은 "페이지에 실제로 보이는 Q&A"만 허용한다. 화면에 없는 내용을
 * 스키마로만 넣으면 정책 위반이므로, 반드시 화면에 렌더링하는 FAQ와 같은
 * 배열을 넘겨야 한다. (구글 리치결과 노출 자체는 2023년부터 공공·의료 사이트로
 * 제한됐지만, 네이버·Bing·음성검색·LLM 파싱에는 여전히 유효하다.)
 */
export function faqJsonLd(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((item) => ({
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
