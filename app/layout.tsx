import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SITE, DISCLAIMER } from '@/lib/site';
import { meta } from '@/lib/data';
import NavLinks from './NavLinks';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // 라이트 모드 전용 사이트임을 명시한다. 없으면 OS 다크모드가 일부 요소만
  // 반전시켜 "흰 배경에 흰 글씨" 같은 대비 사고가 날 수 있다.
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
  // 네이버 서치어드바이저 소유 확인용. 등록 절차에서만 쓰이고 이후엔 그대로 둬도 된다.
  verification: {
    other: { 'naver-site-verification': '344923e4820bd695f73d807549b2018d9dc235c8' },
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
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
        {/* Bebas Neue — 홈 브랜드 카드의 로고체 표기 전용(.brand-wordmark). 본문에는 안 씀 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
        />
        {/* 사이트 전체에 걸리는 구조화 데이터. 지점별 구조화 데이터(MovieTheater)는
            각 지점 상세 페이지에서 따로 넣는다. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
            {/* 꼭 필요한 것만 노출한다. 사이트 소개·면책 고지·광고제휴 고지는
                /about/ 페이지 안의 "관련 정책" 목록에서 연결한다. */}
            <ul className="footer-links">
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
