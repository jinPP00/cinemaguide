import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SITE, DISCLAIMER } from '@/lib/site';
import { meta } from '@/lib/data';
import { brandPath } from '@/lib/data';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - CGV·롯데시네마·메가박스 전국 지점 정보`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 다이내믹 서브셋 — 한국어 본문 가독성 (기획서 16장) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <a className="skip" href="#main">
          본문 바로가기
        </a>

        <header className="site-header">
          <div className="wrap inner">
            <Link href="/" className="logo">
              {SITE.name}
            </Link>
            <nav className="nav" aria-label="주요 메뉴">
              {meta.brands.map((b) => (
                <Link key={b.key} href={brandPath(b.segment)}>
                  {b.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <ul className="footer-links">
              <li>
                <Link href="/about/">사이트 소개</Link>
              </li>
              <li>
                <Link href="/contact/">문의·정정 요청</Link>
              </li>
              <li>
                <Link href="/privacy/">개인정보처리방침</Link>
              </li>
              <li>
                <Link href="/terms/">이용약관</Link>
              </li>
              <li>
                <Link href="/disclaimer/">면책 고지</Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure/">광고·제휴 고지</Link>
              </li>
            </ul>
            <hr className="footer-divider" />
            <p className="disclaimer">{DISCLAIMER}</p>
            <p className="footer-copyright">© {SITE.name}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
