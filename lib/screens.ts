import { branches } from './data';
import { baseFare, specialFares } from './fares';
import type { Branch } from './types';

/**
 * 특별관 정리.
 *
 * 브랜드마다 특별관 이름을 자기식으로 붙여서(같은 모션 좌석 상영관이 CGV는
 * 4DX, 롯데시네마는 수퍼 4D·수퍼MX4D, 메가박스는 MEGA | MX4D다) 이름만으로는
 * 뭐가 뭔지 알 수 없다. 그래서 "무엇이 다른 관인지"로 다시 묶는다.
 *
 * 설명은 상영 방식에 대한 사실만 적는다. 화질·음질이 얼마나 좋은지 같은
 * 홍보 문구는 확인할 방법이 없으므로 쓰지 않는다(lib/content.ts와 같은 원칙).
 * 확인되지 않은 관은 desc를 비워두고 이름과 지점 수, 요금 차이만 보여준다 —
 * 요금은 data/prices.json에서 계산된 값이라 설명이 없어도 근거가 있다.
 */

export type ScreenGroup = '화면' | '음향' | '좌석' | '체감 효과' | '소규모 프리미엄' | '그 밖의 상영관';

export const SCREEN_GROUP_ORDER: ScreenGroup[] = [
  '화면',
  '음향',
  '좌석',
  '체감 효과',
  '소규모 프리미엄',
  '그 밖의 상영관',
];

/**
 * 그룹별 소제목. "{그룹}이 다른 상영관"처럼 틀 하나로 찍어내면 "그 밖의
 * 상영관이 다른 상영관"같이 말이 안 되는 제목이 나온다 — 그룹마다 따로 쓴다.
 */
export const SCREEN_GROUP_HEADING: Record<ScreenGroup, string> = {
  화면: '화면이 다른 상영관',
  음향: '음향이 다른 상영관',
  좌석: '좌석이 다른 상영관',
  '체감 효과': '좌석이 움직이는 상영관',
  '소규모 프리미엄': '좌석 수를 줄인 프리미엄 상영관',
  '그 밖의 상영관': '그 밖의 상영관',
};

export interface ScreenKind {
  /** data/branches.json의 specialScreens에 나오는 이름 그대로 */
  name: string;
  group: ScreenGroup;
  /** 확인된 사실만. 없으면 화면에 설명을 띄우지 않는다. */
  desc: string | null;
  /** 요금표 라벨에서 이 상영관을 찾아내는 패턴 (라벨은 특별관 이름과 표기가 다르다) */
  farePattern: RegExp | null;
}

export const SCREEN_KINDS: ScreenKind[] = [
  {
    name: '아이맥스',
    group: '화면',
    desc: '전용 규격의 대형 스크린과 영사·음향 장비를 함께 갖춘 상영관입니다. 요금표에는 레이저 영사기를 쓰는 IMAX LASER가 따로 잡히기도 합니다.',
    farePattern: /^IMAX/,
  },
  {
    name: 'SCREENX',
    group: '화면',
    desc: '정면 스크린 양옆 벽면까지 영상을 이어 붙여 세 면으로 상영합니다. 모든 장면이 아니라 대응하는 구간에서만 좌우가 켜집니다.',
    farePattern: /^SCREENX/,
  },
  {
    name: '수퍼플렉스',
    group: '화면',
    desc: '롯데시네마의 대형 스크린 상영관입니다.',
    farePattern: /^수퍼플렉스/,
  },
  { name: '수퍼LED(일반)', group: '화면', desc: '영사기로 빛을 쏘는 대신 LED 패널이 직접 화면을 띄우는 상영관입니다.', farePattern: /^수퍼LED/ },
  { name: '수퍼LED(리클)', group: '화면', desc: null, farePattern: /^수퍼LED/ },
  { name: '광음LED', group: '화면', desc: null, farePattern: /^광음LED/ },
  { name: 'MEGA | LED', group: '화면', desc: null, farePattern: /^MEGA \| LED/ },

  {
    name: 'DOLBY CINEMA',
    group: '음향',
    desc: '돌비 비전 영상 규격과 돌비 애트모스 음향을 함께 적용한 상영관입니다.',
    farePattern: /^DOLBY CINEMA/,
  },
  { name: 'DOLBY VISION+ATMOS', group: '음향', desc: null, farePattern: /^DOLBY VISION/ },
  {
    name: 'DOLBY ATMOS',
    group: '음향',
    desc: '천장을 포함해 스피커를 배치하는 입체 음향 규격을 적용한 상영관입니다.',
    farePattern: /^DOLBY ATMOS/,
  },
  { name: 'MEGA | DOLBY ATMOS', group: '음향', desc: null, farePattern: /^MEGA \| DOLBY ATMOS/ },
  {
    name: '광음시네마',
    group: '음향',
    desc: '롯데시네마의 음향 특화 상영관입니다.',
    farePattern: /^광음시네마/,
  },

  {
    name: '리클라이너',
    group: '좌석',
    desc: '등받이가 뒤로 눕는 좌석을 넣은 상영관입니다. 같은 관 안에서도 좌석 등급에 따라 요금이 갈리는 지점이 있습니다.',
    farePattern: /리클라이너/,
  },
  {
    name: 'COMFORT by MEGA',
    group: '좌석',
    desc: '메가박스의 좌석 등급 구분입니다. 요금표에 일반석·스페셜석·커플석이 따로 잡혀 있어 같은 상영관이라도 어느 자리를 고르느냐로 금액이 달라집니다.',
    farePattern: /^COMFORT by MEGA/,
  },
  { name: 'LE RECLINER by MEGA', group: '좌석', desc: null, farePattern: /^LE RECLINER/ },

  {
    name: '4DX',
    group: '체감 효과',
    desc: '좌석이 영상에 맞춰 움직이고 바람·물·향 같은 효과가 함께 나오는 상영관입니다.',
    farePattern: /^4DX/,
  },
  { name: '수퍼 4D', group: '체감 효과', desc: null, farePattern: /^수퍼 ?4D/ },
  { name: '수퍼MX4D', group: '체감 효과', desc: null, farePattern: /^수퍼MX4D/ },
  { name: 'MEGA | MX4D', group: '체감 효과', desc: null, farePattern: /^MEGA \| MX4D/ },

  {
    name: '샤롯데',
    group: '소규모 프리미엄',
    desc: '좌석 수를 줄이고 좌석·부대 서비스 등급을 높인 롯데시네마의 상영관입니다. 요금 차이가 다른 특별관과는 자릿수가 다릅니다.',
    // "샤롯데 프라이빗"은 별도 항목이라 여기서 끌어오면 안 된다
    farePattern: /^샤롯데(?! 프라이빗)/,
  },
  { name: '샤롯데 프라이빗', group: '소규모 프리미엄', desc: null, farePattern: /^샤롯데 프라이빗/ },
  {
    name: 'BOUTIQUE by MEGA',
    group: '소규모 프리미엄',
    desc: '좌석 수가 적은 메가박스의 프리미엄 상영관입니다.',
    farePattern: /^BOUTIQUE by MEGA/,
  },
  { name: 'BOUTIQUE SUITE by MEGA', group: '소규모 프리미엄', desc: null, farePattern: /^BOUTIQUE SUITE by MEGA/ },
  { name: 'BOUTIQUE PRIVATE by MEGA', group: '소규모 프리미엄', desc: null, farePattern: /^BOUTIQUE PRIVATE by MEGA/ },
  { name: 'BOUTIQUE PRIVATE II by MEGA', group: '소규모 프리미엄', desc: null, farePattern: /^BOUTIQUE PRIVATE II by MEGA/ },

  { name: '아르떼', group: '그 밖의 상영관', desc: null, farePattern: /^아르떼/ },
  { name: '씨네비즈', group: '그 밖의 상영관', desc: null, farePattern: /^씨네비즈/ },
  { name: '씨네패밀리', group: '그 밖의 상영관', desc: null, farePattern: /^씨네패밀리/ },
  {
    name: 'MEGABOX KIDS',
    group: '그 밖의 상영관',
    desc: '어린이 관람객을 위해 따로 운영하는 상영관입니다.',
    farePattern: null,
  },
];

const KIND_BY_NAME = new Map(SCREEN_KINDS.map((k) => [k.name, k]));

export function screenKind(name: string): ScreenKind | null {
  return KIND_BY_NAME.get(name) ?? null;
}

export interface ScreenStat {
  kind: ScreenKind;
  /** 이 특별관을 운영하는 지점 수 */
  branchCount: number;
  brandNames: string[];
  /**
   * 기본관 대비 추가요금. 같은 특별관도 좌석 등급에 따라 요금이 갈리므로
   * 한 값이 아니라 구간으로 낸다 — 최솟값만 쓰면 MX4D관의 일반석(+0원)이
   * 정작 그 관의 핵심인 모션석(+4,000원)을 가려버린다.
   * 요금표에서 이 관을 못 찾으면 둘 다 null.
   */
  extraLow: number | null;
  extraHigh: number | null;
  sampleSize: number;
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/**
 * 특별관 종류별 집계.
 *
 * 추가요금은 지점마다 기준이 달라(같은 4DX라도 그 지점 기본관 요금이 다르다)
 * 평균 대신 중앙값을 쓴다. 요금표에 대관·단체가로 보이는 값이 섞인 지점이
 * 있어 평균을 쓰면 한 곳 때문에 전체가 끌려간다.
 */
export function screenStats(): ScreenStat[] {
  const stats = new Map<
    string,
    { count: number; brands: Set<string>; lows: number[]; highs: number[] }
  >();

  for (const branch of branches) {
    if (branch.specialScreens.length === 0) continue;
    const fares = specialFares(branch);

    for (const name of branch.specialScreens) {
      const kind = KIND_BY_NAME.get(name);
      if (!kind) continue;
      const entry = stats.get(name) ?? {
        count: 0,
        brands: new Set<string>(),
        lows: [],
        highs: [],
      };
      entry.count++;
      entry.brands.add(branch.brandName);

      if (kind.farePattern) {
        // 한 특별관이 좌석 등급별로 여러 줄인 지점이 있다(SCREENX 일반석·
        // 리클라이너석, MX4D 일반석·모션석 등). 지점마다 그 지점 안의 최저·
        // 최고를 하나씩만 모아서, 좌석 등급이 많은 지점이 통계를 좌우하지
        // 않게 한다.
        const extras = fares.filter((f) => kind.farePattern!.test(f.label)).map((f) => f.extra);
        if (extras.length > 0) {
          entry.lows.push(Math.min(...extras));
          entry.highs.push(Math.max(...extras));
        }
      }
      stats.set(name, entry);
    }
  }

  return SCREEN_KINDS.filter((k) => stats.has(k.name)).map((kind) => {
    const entry = stats.get(kind.name)!;
    return {
      kind,
      branchCount: entry.count,
      brandNames: [...entry.brands],
      extraLow: entry.lows.length > 0 ? median(entry.lows) : null,
      extraHigh: entry.highs.length > 0 ? median(entry.highs) : null,
      sampleSize: entry.lows.length,
    };
  });
}

/** 화면에 쓰는 추가요금 표기. 좌석 등급으로 갈리면 구간으로 보여준다. */
export function formatExtra(stat: ScreenStat): string {
  if (stat.extraLow == null || stat.extraHigh == null) return '요금표 미확인';
  if (stat.extraLow === 0 && stat.extraHigh === 0) return '추가요금 없음';
  if (stat.extraLow === stat.extraHigh) return `+${stat.extraLow.toLocaleString()}원`;
  return `+${stat.extraLow.toLocaleString()}~${stat.extraHigh.toLocaleString()}원`;
}

/** 특정 특별관을 운영하는 지점 목록 */
export function branchesWithScreen(name: string): Branch[] {
  return branches.filter((b) => b.specialScreens.includes(name));
}

/** 특별관을 하나라도 운영하는 지점 수 */
export function specialScreenBranchCount(): number {
  return branches.filter((b) => b.specialScreens.length > 0).length;
}

/** 기준 요금을 뽑을 수 있는 지점 수 — 비교표의 모집단을 밝힐 때 쓴다 */
export function comparableBranchCount(): number {
  return branches.filter((b) => baseFare(b) != null).length;
}
