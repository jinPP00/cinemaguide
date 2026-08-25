/**
 * 정책 문서 공통 값.
 *
 * ⚠️ 중요: 개인정보처리방침은 실제 운영 상태와 일치해야 한다. (가이드 11.6)
 * 아래 플래그를 켜기 전에는 해당 도구를 사용하지 않는다고 문서에 표기되며,
 * 실제로 도입할 때 이 값을 바꾸면 정책 문서 내용도 함께 바뀐다.
 */
export const LEGAL = {
  /** 정책 시행일 */
  effectiveDate: '2026-07-26',
  /** 마지막 개정일 */
  updatedDate: '2026-08-14',

  /** 현재 실제로 사용 중인 도구 — 도입 시 true로 바꾼다 */
  usesAnalytics: false,
  usesAds: true,
  usesContactForm: false,

  /** 호스팅 (개인정보 국외 이전 고지에 필요) */
  hosting: {
    name: 'Cloudflare, Inc.',
    country: '미국',
    role: '웹사이트 호스팅 및 콘텐츠 전송(CDN)',
  },

  /** 문의 접수 수단 */
  emailProvider: {
    name: 'Google LLC (Gmail)',
    country: '미국',
    role: '문의 이메일 수신·보관',
  },

  /** 광고 (Google AdSense) */
  adsProvider: {
    name: 'Google LLC (AdSense)',
    country: '미국',
    role: '광고 게재 및 맞춤 광고 제공',
  },
} as const;

/** 정책 문서 개정 이력 — 변경할 때마다 위에 추가한다 */
export const REVISIONS = [
  { date: '2026-07-26', note: '최초 시행' },
  // 심사용 스크립트와 ads.txt는 올렸지만 승인 전이라 광고가 실제로 게재되지는
  // 않는다. "도입"은 게재가 시작된 것처럼 읽히므로 문서와 실제를 맞춘다.
  { date: '2026-08-14', note: 'Google AdSense 광고 관련 내용 추가' },
];
