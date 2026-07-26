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
  updatedDate: '2026-07-26',

  /** 현재 실제로 사용 중인 도구 — 도입 시 true로 바꾼다 */
  usesAnalytics: false,
  usesAds: false,
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
} as const;

/** 정책 문서 개정 이력 — 변경할 때마다 위에 추가한다 */
export const REVISIONS = [
  { date: '2026-07-26', note: '최초 시행' },
];
