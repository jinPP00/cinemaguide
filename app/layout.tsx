import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import './detail-unified.css';
import './editorial-polish.css';
import { SITE, DISCLAIMER } from '@/lib/site';
import { meta } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import NavLinks from './NavLinks';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  other: { 'color-scheme': 'light' },
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
  verification: {
    other: { 'naver-site-verification': '344923e4820bd695f73d807549b2018d9dc235c8' },
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.operator,
  url: SITE.url,
  description: SITE.description,
  contactPoint: {
    '@type': 'ContactPoint',
    email: SITE.email,
    contactType: 'customer support',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  publisher: { '@id': `${SITE.url}/#organization` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, organizationJsonLd]) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4378510721922617"
          crossOrigin="anonymous"
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
            <NavLinks brands={meta.brands} />
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <ul className="footer-links">
              <li>
                <Link href={guidePath(GUIDES.fares)}>관람료 비교</Link>
              </li>
              <li>
                <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>
              </li>
              <li>
                <Link href={guidePath(GUIDES.boxoffice)}>박스오피스 순위</Link>
              </li>
            </ul>

            <ul className="footer-links">
              <li>
                <Link href="/about/">사이트 소개</Link>
              </li>
              <li>
                <Link href="/privacy/">개인정보처리방침</Link>
              </li>
              <li>
                <Link href="/terms/">이용약관</Link>
              </li>
              <li>
                <Link href="/contact/">문의·정정 요청</Link>
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
