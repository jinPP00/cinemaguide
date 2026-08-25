import { branches, meta, pricesOf } from './data';
import type { Branch, BrandKey, PriceRow } from './types';

/**
 * 3사 요금표를 비교 가능한 형태로 맞추는 계산.
 *
 * 세 브랜드는 같은 것을 다른 이름으로 부른다. 일반 상영관 2D 성인 요금이
 * CGV에서는 "일반(2D)", 롯데시네마는 "2D 일반석", 메가박스는 "일반 2D"다.
 * 조조 할인도 CGV만 "모닝"이고 나머지는 "조조"다. 그래서 요금표를 나란히
 * 놓는 것만으로는 비교가 안 되고, 브랜드별로 "어느 줄이 기준선인지"를
 * 지정해줘야 한다. 그 지정이 이 파일의 전부다.
 *
 * 비교 기준을 평일 일반 시간대 성인가로 잡은 이유: 세 브랜드가 공통으로
 * 갖고 있는 유일한 조합이다. 심야는 CGV 18곳·롯데 16곳에만 있고,
 * 브런치는 사실상 CGV 전용이라 기준선으로 쓸 수 없다.
 */

/**
 * 브랜드별 "기본관" 라벨 우선순위.
 *
 * 앞에서부터 찾아 처음 걸리는 것을 그 지점의 기준선으로 삼는다. 두 번째
 * 이후 항목이 필요한 이유는 일반관이 아예 없는 지점이 있기 때문이다 —
 * 메가박스는 52곳이 COMFORT관만 운영해서 "일반 2D" 줄 자체가 없고,
 * CGV 리클라이너 전용 지점(씨네드쉐프 등) 31곳도 마찬가지다. 그런 지점은
 * 그 관이 곧 기본관이므로, 무엇을 기준으로 삼았는지 label로 함께 돌려주고
 * 화면에도 그대로 표기한다.
 */
const BASE_LABELS: Record<BrandKey, string[]> = {
  cgv: ['일반(2D)', '리클라이너(2D)'],
  lotte: ['2D 일반석', '리클라이너 2D 일반석'],
  megabox: ['일반 2D', 'COMFORT by MEGA 2D', 'LE RECLINER by MEGA 2D'],
};

/**
 * 시간대를 화면에 나열하는 순서.
 *
 * 요금표에서 뽑은 값을 그대로 정렬하면 "일반·조조"처럼 가나다순이 돼서 실제
 * 상영 순서와 뒤집힌다. 하루가 흘러가는 순서로 고정한다.
 */
const SLOT_ORDER = ['모닝', '조조', '브런치', '일반', '프라임', '심야', '특회차'];

export function sortSlots(slots: string[]): string[] {
  return [...slots].sort((a, b) => {
    const ai = SLOT_ORDER.indexOf(a);
    const bi = SLOT_ORDER.indexOf(b);
    // 목록에 없는 이름은 뒤로 보낸다
    return (ai < 0 ? SLOT_ORDER.length : ai) - (bi < 0 ? SLOT_ORDER.length : bi);
  });
}

/** 조조 할인 시간대의 브랜드별 명칭. CGV만 "모닝"으로 부른다. */
export const MORNING_SLOT: Record<BrandKey, string> = {
  cgv: '모닝',
  lotte: '조조',
  megabox: '조조',
};

export interface BaseFare {
  /** 기준으로 삼은 요금표 라벨 (지점에 따라 일반관이 아닐 수 있다) */
  label: string;
  /** 일반관 요금표가 없어 다른 관을 기준으로 잡은 경우 */
  isFallback: boolean;
  weekdayAdult: number;
  weekendAdult: number;
  weekdayYouth: number | null;
  morningAdult: number | null;
  morningSlot: string;
}

const findRow = (rows: PriceRow[], label: string, slot: string, day: '평일' | '주말') =>
  rows.find(
    (r) => r.label === label && r.timeSlot === slot && r.dayType === day && r.adult != null,
  );

/**
 * 지점의 기준 요금. 평일·주말 성인가가 둘 다 있어야 비교에 쓸 수 있으므로
 * 하나라도 없으면 그 라벨은 건너뛰고 다음 후보로 넘어간다.
 */
export function baseFare(branch: Branch): BaseFare | null {
  const rows = pricesOf(branch.id);
  const candidates = BASE_LABELS[branch.brand];
  const morningSlot = MORNING_SLOT[branch.brand];

  for (let i = 0; i < candidates.length; i++) {
    const label = candidates[i];
    const weekday = findRow(rows, label, '일반', '평일');
    const weekend = findRow(rows, label, '일반', '주말');
    if (!weekday?.adult || !weekend?.adult) continue;

    return {
      label,
      isFallback: i > 0,
      weekdayAdult: weekday.adult,
      weekendAdult: weekend.adult,
      weekdayYouth: weekday.youth,
      morningAdult: findRow(rows, label, morningSlot, '평일')?.adult ?? null,
      morningSlot,
    };
  }
  return null;
}

export interface SpecialFare {
  /** 요금표에 적힌 그대로의 라벨 */
  label: string;
  adult: number;
  /** 같은 지점 기본관 대비 차액 */
  extra: number;
}

/**
 * 이 지점 특별관들이 기본관보다 얼마나 비싼지.
 *
 * 3D는 제외한다 — 상영관 등급이 아니라 같은 관의 상영 방식 차이라서
 * 섞으면 "특별관 추가요금"이라는 숫자의 의미가 흐려진다.
 * 차액이 0원인 관도 그대로 남긴다. 광음시네마 일반석처럼 특별관인데
 * 추가요금이 없는 경우가 실제로 있고, 그게 알고 싶은 정보이기 때문이다.
 */
export function specialFares(branch: Branch): SpecialFare[] {
  const base = baseFare(branch);
  if (!base) return [];

  const seen = new Map<string, SpecialFare>();
  for (const row of pricesOf(branch.id)) {
    if (row.timeSlot !== '일반' || row.dayType !== '평일' || row.adult == null) continue;
    if (row.label === base.label || /3D/.test(row.label)) continue;
    if (seen.has(row.label)) continue;
    seen.set(row.label, {
      label: row.label,
      adult: row.adult,
      extra: row.adult - base.weekdayAdult,
    });
  }
  return [...seen.values()].sort((a, b) => b.extra - a.extra);
}

export interface BrandFareSummary {
  brand: BrandKey;
  brandName: string;
  count: number;
  weekdayLow: number;
  weekdayHigh: number;
  weekdayCommon: number;
  weekendCommon: number;
  morningLow: number | null;
}

/** 최빈값. 같은 횟수면 싼 쪽을 택한다 — "대체로 이 값"을 보여주는 게 목적이라 */
function mostCommon(values: number[]): number {
  const tally = new Map<number, number>();
  for (const v of values) tally.set(v, (tally.get(v) ?? 0) + 1);
  return [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
}

/**
 * 한 지역(시도) 안에서 3사 기준 요금이 어떻게 갈리는지.
 * sido를 주지 않으면 전국 기준으로 계산한다.
 */
export function brandFareSummaries(sido?: string): BrandFareSummary[] {
  const buckets = new Map<BrandKey, { name: string; fares: BaseFare[] }>();

  for (const branch of branches) {
    if (sido && branch.sido !== sido) continue;
    const fare = baseFare(branch);
    if (!fare) continue;
    const bucket = buckets.get(branch.brand) ?? { name: branch.brandName, fares: [] };
    bucket.fares.push(fare);
    buckets.set(branch.brand, bucket);
  }

  return [...buckets.entries()]
    .map(([brand, { name, fares }]) => {
      const weekday = fares.map((f) => f.weekdayAdult);
      const mornings = fares.map((f) => f.morningAdult).filter((v): v is number => v != null);
      return {
        brand,
        brandName: name,
        count: fares.length,
        weekdayLow: Math.min(...weekday),
        weekdayHigh: Math.max(...weekday),
        weekdayCommon: mostCommon(weekday),
        weekendCommon: mostCommon(fares.map((f) => f.weekendAdult)),
        morningLow: mornings.length > 0 ? Math.min(...mornings) : null,
      };
    })
    .sort((a, b) => a.weekdayCommon - b.weekdayCommon);
}

export const won = (n: number) => `${n.toLocaleString()}원`;

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

export interface RegionSplit {
  sido: string;
  cheapest: BrandFareSummary;
  priciest: BrandFareSummary;
  gap: number;
}

export interface FareInsight {
  /** 평일 일반가 − 조조가 */
  morningDiscount: number;
  /** 주말 − 평일 */
  weekendPremium: number;
  /** 3사 기준 요금이 같은 시도 */
  levelSidos: string[];
  /** 브랜드에 따라 갈리는 시도. 차이가 큰 순서 */
  splitSidos: RegionSplit[];
}

/**
 * 요금표 전체에서 실제로 확인되는 경향만 뽑는다.
 *
 * 지역 비교 순위에서 브랜드당 3곳 미만은 제외한다 — 한두 곳뿐인 지역은 그
 * 지점 사정이 곧 지역 대푯값이 돼버려서 "이 지역은 어느 브랜드가 싸다"고
 * 말할 근거가 못 된다. 표에는 그대로 두되 순위에서만 뺀다.
 */
export function fareInsight(): FareInsight {
  const morning: number[] = [];
  const weekend: number[] = [];
  for (const branch of branches) {
    const fare = baseFare(branch);
    if (!fare) continue;
    weekend.push(fare.weekendAdult - fare.weekdayAdult);
    if (fare.morningAdult != null) morning.push(fare.weekdayAdult - fare.morningAdult);
  }

  const levelSidos: string[] = [];
  const splitSidos: RegionSplit[] = [];

  for (const sido of meta.sidoOrder) {
    const rows = brandFareSummaries(sido);
    if (rows.length < 2) continue;

    if (new Set(rows.map((r) => r.weekdayCommon)).size === 1) {
      levelSidos.push(sido);
      continue;
    }

    const solid = rows.filter((r) => r.count >= 3);
    if (solid.length < 2) continue;
    const cheapest = solid[0];
    const priciest = solid[solid.length - 1];
    if (cheapest.weekdayCommon === priciest.weekdayCommon) continue;

    splitSidos.push({
      sido,
      cheapest,
      priciest,
      gap: priciest.weekdayCommon - cheapest.weekdayCommon,
    });
  }

  return {
    morningDiscount: median(morning),
    weekendPremium: median(weekend),
    levelSidos,
    splitSidos: splitSidos.sort((a, b) => b.gap - a.gap),
  };
}

export interface FareExtreme {
  brand: BrandKey;
  brandName: string;
  cheapest: { branch: Branch; adult: number; label: string };
  priciest: { branch: Branch; adult: number; label: string };
  spread: number;
}

/**
 * 브랜드별로 가장 싼 지점과 가장 비싼 지점.
 *
 * 이 값이 필요한 이유: 브랜드끼리 비교하면 기준 요금이 거의 같게 나오는데,
 * 같은 브랜드 안에서 지점끼리 비교하면 차이가 훨씬 크다. "어느 브랜드로
 * 갈까"보다 "어느 지점으로 갈까"가 금액을 좌우한다는 사실은 3사 요금표를
 * 한자리에 놓고 봐야만 보인다.
 */
export function fareExtremes(): FareExtreme[] {
  const buckets = new Map<
    BrandKey,
    { name: string; rows: { branch: Branch; adult: number; label: string }[] }
  >();

  for (const branch of branches) {
    const fare = baseFare(branch);
    if (!fare) continue;
    const bucket = buckets.get(branch.brand) ?? { name: branch.brandName, rows: [] };
    bucket.rows.push({ branch, adult: fare.weekdayAdult, label: fare.label });
    buckets.set(branch.brand, bucket);
  }

  return [...buckets.entries()].map(([brand, { name, rows }]) => {
    const sorted = rows.sort((a, b) => a.adult - b.adult);
    const cheapest = sorted[0];
    const priciest = sorted[sorted.length - 1];
    return {
      brand,
      brandName: name,
      cheapest,
      priciest,
      spread: priciest.adult - cheapest.adult,
    };
  });
}

export interface BrandProfile {
  brand: BrandKey;
  brandName: string;
  branchCount: number;
  /** 특별관을 운영하는 지점 수와 종류 수 */
  specialBranchCount: number;
  specialKindCount: number;
  /** 요금표가 몇 개 시간대로 나뉘는지 — 가장 흔한 조합 기준 */
  commonSlots: string[];
  /** 요금표에 좌석 등급이 따로 잡힌 지점 수 */
  seatGradedCount: number;
  weekdayCommon: number | null;
}

/**
 * 브랜드가 요금을 어떤 축으로 쪼개는지.
 *
 * 세 브랜드는 기준 요금이 거의 같은데(brandFareSummaries 참고) 요금표를 나누는
 * 방식이 다르다. CGV는 시간대를 잘게 쪼개고, 롯데시네마는 좌석 등급을 쪼갠다.
 * 어느 쪽이 자기 관람 습관에 유리한지는 이 차이에서 갈리는데, 브랜드 하나만
 * 보면 비교 대상이 없어 드러나지 않는다.
 */
export function brandProfiles(): BrandProfile[] {
  return meta.brands.map((info) => {
    const list = branches.filter((b) => b.brand === info.key);

    const slotTally = new Map<string, number>();
    const kinds = new Set<string>();
    let specialBranchCount = 0;
    let seatGradedCount = 0;

    for (const branch of list) {
      const rows = pricesOf(branch.id);
      const slots = [...new Set(rows.map((r) => r.timeSlot).filter((s): s is string => !!s))];
      if (slots.length > 0) {
        const key = slots.sort().join('\u0000');
        slotTally.set(key, (slotTally.get(key) ?? 0) + 1);
      }
      // 롯데시네마 "2D 일반석"·메가박스 "COMFORT by MEGA 2D 커플석"처럼 라벨이
      // "…석"으로 끝나면 같은 상영관 안에서 좌석마다 값이 다르다는 뜻이다.
      if (rows.some((r) => /석$/.test(r.label))) seatGradedCount++;
      if (branch.specialScreens.length > 0) specialBranchCount++;
      branch.specialScreens.forEach((s) => kinds.add(s));
    }

    const topSlots = [...slotTally.entries()].sort((a, b) => b[1] - a[1])[0];
    const summary = brandFareSummaries().find((s) => s.brand === info.key);

    return {
      brand: info.key,
      brandName: info.name,
      branchCount: list.length,
      specialBranchCount,
      specialKindCount: kinds.size,
      commonSlots: topSlots ? sortSlots(topSlots[0].split('\u0000')) : [],
      seatGradedCount,
      weekdayCommon: summary?.weekdayCommon ?? null,
    };
  });
}
