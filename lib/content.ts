import type { BrandKey } from './types';

/**
 * 브랜드별 소개 문구.
 * 가이드 3.3(복붙 방지)에 따라 브랜드마다 다른 내용을 쓴다.
 * 사실 관계는 크롤링 데이터에서 확인된 범위만 서술하고, 확인되지 않은 내용은 쓰지 않는다.
 */
export const BRAND_INTRO: Record<
  BrandKey,
  { lead: string; highlights: { title: string; desc: string }[] }
> = {
  cgv: {
    lead:
      'CGV는 세 브랜드 중 지점이 가장 많아요. IMAX·4DX·SCREENX 특별관을 둔 지점이 많아서, 같은 영화도 어느 지점 어느 관에서 보느냐에 따라 요금이 달라져요.',
    highlights: [
      {
        title: '특별관 요금',
        desc: 'IMAX·4DX 같은 특별관은 일반관과 요금이 따로 있어요. 보려는 관이 그 지점에 있는지 먼저 확인하세요.',
      },
      {
        title: '시간대 구분',
        desc: '모닝·브런치·일반·심야로 나뉘고 평일과 주말 요금이 달라요. 시작 시간을 조금만 옮겨도 요금이 바뀌어요.',
      },
      {
        title: '주차',
        desc: '건물 주차장, 발레, 제휴 주차장이 지점마다 달라서 무료 시간과 초과 요금도 제각각이에요.',
      },
    ],
  },
  lotte: {
    lead:
      '롯데시네마는 백화점·아울렛·롯데몰 안에 있는 지점이 많아요. 쇼핑몰 영업이 끝난 뒤에는 출입구와 주차 정산 방법이 바뀌는 곳이 있어요.',
    highlights: [
      {
        title: '늦은 시간 출입',
        desc: '쇼핑몰 영업이 끝나면 영화관 전용 출입구로만 드나들 수 있는 지점이 있어요. 심야 회차를 본다면 미리 확인하세요.',
      },
      {
        title: '특별관',
        desc: '샤롯데, 수퍼플렉스, 광음시네마 등 지점마다 갖춘 관이 달라요. 요금표에 경로·장애인 요금이 따로 적혀 있어요.',
      },
      {
        title: '쇼핑몰 주차장',
        desc: '쇼핑몰 구매 금액에 따라 무료 시간이 늘어나기도 하고, 정산기가 영화관이 아니라 주차장 층에 있는 곳도 있어요.',
      },
    ],
  },
  megabox: {
    lead:
      '메가박스는 좌석 등급별로 요금을 나누는 지점이 많아요. 같은 상영관 안에서도 일반석·스페셜석·커플석 요금이 다를 수 있으니 예매할 때 좌석 등급을 확인하세요.',
    highlights: [
      {
        title: '컴포트관',
        desc: 'COMFORT by MEGA가 가장 많고, 돌비 시네마와 부티크 계열 상영관이 있는 지점도 있어요.',
      },
      {
        title: '층별 동선',
        desc: '상영관이 여러 층에 나뉜 지점이 많아 매표소와 상영관 층이 다를 수 있어요.',
      },
      {
        title: '심야 상영',
        desc: '조조와 일반 시간대만 있는 지점도 있어요. 늦은 시간 회차는 공식 시간표에서 확인하세요.',
      },
    ],
  },
};

/** 시도별 목록 페이지 인트로 — 지역마다 다른 문장이 나오도록 데이터 기반으로 구성 */
export function sidoIntro(
  brandName: string,
  sido: string,
  count: number,
  specialCount: number,
  cityCount: number,
): string {
  const parts: string[] = [];

  parts.push(
    `${sido}에는 ${brandName} 지점이 ${count}곳 있어요.` +
      (cityCount > 1 ? ` ${cityCount}개 시·군·구에 걸쳐 있어요.` : ''),
  );

  if (specialCount > 0) {
    parts.push(`이 중 ${specialCount}곳에 특별관이 있어요.`);
  }

  parts.push('지점을 누르면 주소, 가는 길, 주차, 관람료와 공식 상영시간표 링크가 나와요.');

  return parts.join(' ');
}
