import type { Metadata } from 'next';
import { SITE } from './site';

/** canonical과 공유 카드가 같은 페이지를 가리키게 한다. 파일 기반 OG 이미지는 유지한다. */
export function withOpenGraphUrl(metadata: Metadata): Metadata {
  const canonical = metadata.alternates?.canonical;
  if (!canonical) throw new Error('공유 메타에는 canonical URL이 필요합니다.');
  const url = typeof canonical === 'string' || canonical instanceof URL ? canonical : canonical.url;
  return {
    ...metadata,
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: 'ko_KR',
      ...metadata.openGraph,
      url,
    },
  };
}
