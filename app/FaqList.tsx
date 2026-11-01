import type { CSSProperties, ReactNode } from 'react';
import { faqPageJsonLd, jsonLdScript } from '@/lib/jsonld';

/**
 * 자주 묻는 질문 목록. 화면의 질문·답과 FAQPage 구조화 데이터를 같은 배열에서
 * 만들어 둘이 어긋나지 않게 한다. 답에 링크를 넣어야 하면 node로 화면용 내용을
 * 따로 넘기되, a에는 같은 문장을 글자로 적는다(구조화 데이터에는 a가 들어간다).
 */
export type FaqItem = { q: string; a: string; node?: ReactNode };

export default function FaqList({ items, style }: { items: FaqItem[]; style?: CSSProperties }) {
  if (items.length === 0) return null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqPageJsonLd(items))} />
      <dl className="faq-list" style={style}>
        {items.map((item) => (
          <div className="faq-item" key={item.q}>
            <dt>{item.q}</dt>
            <dd>{item.node ?? item.a}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
