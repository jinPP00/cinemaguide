export type BrandKey = 'cgv' | 'lotte' | 'megabox';

/** 지점의 교통 안내. 브랜드마다 제공 형태가 달라 셋 다 null일 수 있다. */
export interface Transit {
  /** CGV: 지하철·버스가 한 덩어리 텍스트 */
  raw: string | null;
  /** 롯데·메가박스: 버스 안내 */
  bus: string | null;
  /** 롯데·메가박스: 지하철 안내 */
  subway: string | null;
}

/** 주차 안내. CGV는 raw 한 덩어리, 나머지는 항목별로 나뉜다. */
export interface Parking {
  raw: string | null;
  guide: string | null;
  howTo: string | null;
  fee: string | null;
}

/** 메가박스만 제공하는 시설 정보 */
export interface Facility {
  screens: string[] | null;
  floors: string[] | null;
}

export interface Branch {
  id: string;
  brand: BrandKey;
  brandName: string;
  /** URL에 쓰는 브랜드 조각 (cgv / 롯데시네마 / 메가박스) */
  brandSegment: string;
  name: string;
  slug: string;
  sido: string;
  sigungu: string | null;
  address: string;
  /** CGV만 보유 */
  tel: string | null;
  lat: string | null;
  lng: string | null;
  specialScreens: string[];
  screenCount: number | null;
  seatCount: number | null;
  intro: string | null;
  transit: Transit;
  parking: Parking;
  facility: Facility | null;
  mapLink: string | null;
  status: '운영중' | '휴관';
  hasPrices: boolean;
  officialUrl: string;
  /** 상영시간표 CTA 목적지 (기획서 3.1) */
  scheduleUrl: string;
  sourceId: string;
  originalRegion: string | null;
  checkedAt: string;
  verificationStatus: '확인완료' | '확인필요';
}

export interface PriceRow {
  label: string;
  timeSlot: string | null;
  dayType: '평일' | '주말';
  adult: number | null;
  youth: number | null;
  senior: number | null;
  disabled: number | null;
}

export interface Meta {
  generatedAt: string;
  checkedAt: string;
  totalBranches: number;
  brands: { key: BrandKey; name: string; segment: string; count: number }[];
  sidoOrder: string[];
  byBrandSido: Record<string, Record<string, number>>;
  counts: Record<string, number>;
  warnings: string[];
}
