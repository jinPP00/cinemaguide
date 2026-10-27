/**
 * 사이트 전역 상수.
 * 도메인·운영자·측정 ID는 아직 미확정이라 여기 한 곳에서만 관리한다. (기획서 21장)
 */
export const SITE = {
  name: '영화관 지점안내',
  /** 확정 도메인. canonical·sitemap·OG 전부 이 값을 기준으로 생성된다. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cinemaguide.kr',
  description:
    'CGV·롯데시네마·메가박스 전국 425개 지점의 위치, 가는 길, 주차, 관람료.',
  operator: '영화관 지점안내 운영자',
  email: 'contact@cinemaguide.kr',
} as const;

/** 전 페이지 푸터에 노출하는 비공식 고지 (기획서 13장) */
export const DISCLAIMER =
  '이 사이트는 CJ CGV, 롯데컬처웍스, 메가박스중앙의 공식 서비스가 아닌 비공식 안내 사이트입니다. ' +
  '상영시간표, 지점 정보, 요금, 주차 정책은 바뀔 수 있으니 가기 전에 공식 채널에서 확인하세요.';
