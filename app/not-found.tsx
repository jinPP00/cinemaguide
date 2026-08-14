import Link from 'next/link';
import type { Metadata } from 'next';
import { meta } from '@/lib/data';
import { brandPath } from '@/lib/data';

/**
 * Next.js 기본 not-found 경계는 자체 <title>을 하드코딩해서 렌더링하고
 * 루트 레이아웃의 metadata title과 함께 문서에 두 개가 남는 문제가 있었다
 * (검증: out/404.html에 <title> 태그 2개). 이 파일로 기본 경계를 대체하면
 * 이 파일의 metadata만 적용돼 <title>이 정확히 하나로 정리된다.
 */
export const metadata: Metadata = {
  title: '페이지를 찾을 수 없음',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="wrap page">
      <h1>페이지를 찾을 수 없음</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        요청하신 페이지를 찾을 수 없습니다. 주소가 바뀌었거나 삭제되었을 수 있습니다.
      </p>
      <div className="badges" style={{ marginTop: 24 }}>
        <Link className="cta-button" href="/">
          홈으로 이동
        </Link>
      </div>
      <section className="section" aria-labelledby="nf-brands">
        <h2 id="nf-brands">브랜드별로 찾아보기</h2>
        <ul className="chip-list" style={{ marginTop: 14 }}>
          {meta.brands.map((b) => (
            <li key={b.key}>
              <Link className="chip" href={brandPath(b.segment)}>
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
