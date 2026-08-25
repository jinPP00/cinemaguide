import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import './detail-unified.css';
import { SITE, DISCLAIMER } from '@/lib/site';
import { meta } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
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

/**
 * Organization은 "이 사이트를 누가 운영하는가"를 기계가 읽게 하는 신호다.
 * 검색엔진의 리치결과보다도 AI 검색(GEO)에서 더 중요하다 — LLM이 답변에
 * 이 사이트를 인용할 때 "출처가 명확한 정보원인가"를 판단하는 근거가 된다.
 * SITE.operator/email은 이미 about·contact·privacy·terms 페이지에 공개돼
 * 있는 값이라 여기서 새로 노출되는 정보는 없다.
 */
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
  // Organization을 별 객체로 참조만 한다(@id) — 이름 문자열을 중복해서 넣으면
  // 두 개체를 같은 실체로 인식 못 할 수 있다.
  publisher: { '@id': `${SITE.url}/#organization` },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, organizationJsonLd]) }}
        />
        {/* Google AdSense 사이트 연결 코드. public/_headers의 CSP에 관련 도메인을
            같이 허용해뒀다 — CSP 갱신 없이 이 스크립트만 추가하면 브라우저가 막는다.
            실제 광고 게재 시작 시 lib/legal.ts의 usesAds가 true인 상태를 유지할 것
            (개인정보처리방침 내용이 이 플래그로 갈리므로 실제와 반드시 일치시킨다). */}
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
            {/* 안내 페이지는 전 페이지에서 닿아야 한다 — 지점 페이지에서 들어온
                사람이 다시 홈으로 돌아가지 않고도 3사 비교로 넘어갈 수 있게. */}
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

            {/* 사이트 소개는 푸터에 직접 둔다. 지점 페이지가 425개인 사이트라
                "누가 어떤 기준으로 이 데이터를 정리했는지"에 어느 페이지에서든
                바로 닿을 수 있어야 한다. 면책·광고제휴 고지는 /about/ 안의
                "관련 정책" 목록에서 계속 연결한다. */}
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
