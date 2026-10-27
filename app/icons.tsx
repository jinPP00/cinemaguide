/** 클래퍼보드(영화 슬레이트) 아이콘 — 로고·홈 첫 화면에서 공통으로 쓴다 */
export const IconClapper = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 10.5V18a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-7.5H4Z" />
    <path d="M4 10.5 5 5h14l1 5.5" />
    <path d="m8 5 1.5 3.2M13 5l1.5 3.2" strokeLinecap="round" />
  </svg>
);

/* 홈 숫자 타일·안내 카드용 선 아이콘. 같은 굵기(2)와 둥근 끝으로 맞춘다. */
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** 위치 핀 */
export const IconPin = () => (
  <Svg>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);

/** 관람권 */
export const IconTicket = () => (
  <Svg>
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" />
    <path d="M14 6v12" strokeDasharray="2 2.5" />
  </Svg>
);

/** 별(특별관) */
export const IconSparkle = () => (
  <Svg>
    <path d="M12 3.5 14.2 9l5.8.5-4.4 3.8 1.4 5.7L12 16l-5 3 1.4-5.7L4 9.5 9.8 9Z" />
  </Svg>
);

/** 자동차(주차) */
export const IconCar = () => (
  <Svg>
    <path d="M5 16V11l2-5h10l2 5v5" />
    <path d="M3 16h18v2.5H3z" />
    <circle cx="7.5" cy="13" r="0.8" fill="currentColor" />
    <circle cx="16.5" cy="13" r="0.8" fill="currentColor" />
  </Svg>
);

/** 동전(요금) */
export const IconCoin = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 9.5 10 15l2-4 2 4 1.5-5.5M8 12h8" />
  </Svg>
);

/** 퍼센트(할인) */
export const IconPercent = () => (
  <Svg>
    <path d="M19 5 5 19" />
    <circle cx="7" cy="7" r="2.2" />
    <circle cx="17" cy="17" r="2.2" />
  </Svg>
);

/** 막대 그래프(영화 순위) */
export const IconChart = () => (
  <Svg>
    <path d="M5 20V12M12 20V5M19 20v-9" />
  </Svg>
);
