import { branches } from './data';
import type { Branch } from './types';

/**
 * 지점 간 거리 계산.
 *
 * 좌표는 425곳 전부 갖고 있다(data/meta.json의 counts.좌표없음 = 0). 그래서
 * "이 근처에 다른 영화관이 있는가"는 새 데이터를 구하지 않고도 답할 수 있는
 * 몇 안 되는 질문이다 — 3사 공식 사이트는 자사 지점만 보여주기 때문에
 * 브랜드를 가로지르는 이 정보는 그쪽에 존재할 수 없다.
 *
 * ⚠️ 이 파일은 data.ts를 import하므로 서버 컴포넌트에서만 쓴다.
 * 클라이언트 컴포넌트에서 부르면 branches.json이 통째로 번들에 들어간다
 * (lib/paths.ts 주석 참고).
 */

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** 두 좌표 사이의 직선거리(km). 실제 도보·차량 경로가 아니라 지도상 직선이다. */
export function distanceKm(
  a: { lat: string | null; lng: string | null },
  b: { lat: string | null; lng: string | null },
): number | null {
  if (!a.lat || !a.lng || !b.lat || !b.lng) return null;
  const dLat = toRad(Number(b.lat) - Number(a.lat));
  const dLng = toRad(Number(b.lng) - Number(a.lng));
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(Number(a.lat))) * Math.cos(toRad(Number(b.lat))) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface NearbyBranch {
  branch: Branch;
  km: number;
}

/**
 * 가까운 순서로 인근 지점을 찾는다.
 *
 * 반경을 고정하지 않고 두 단계로 나눈 이유: 도심 지점은 2km 안에 서너 곳이
 * 몰려 있지만 지방 지점은 20km를 잡아도 한 곳도 안 나오는 경우가 있다.
 * 반경만 쓰면 지방 지점에서 섹션이 통째로 사라지고, 개수만 쓰면 도심에서
 * 아무 상관 없는 먼 지점이 딸려 들어온다. 그래서 반경 안의 지점을 먼저 채우고,
 * 하나도 없을 때만 거리에 상관없이 가장 가까운 곳을 보여준다.
 */
export function nearbyBranches(
  target: Branch,
  { radiusKm = 3, limit = 4 }: { radiusKm?: number; limit?: number } = {},
): NearbyBranch[] {
  const measured: NearbyBranch[] = [];
  for (const branch of branches) {
    if (branch.id === target.id) continue;
    const km = distanceKm(target, branch);
    if (km == null) continue;
    measured.push({ branch, km });
  }
  measured.sort((a, b) => a.km - b.km);

  const within = measured.filter((n) => n.km <= radiusKm);
  return (within.length > 0 ? within : measured.slice(0, 1)).slice(0, limit);
}

/**
 * 화면에 쓰는 거리 표기. 1km 미만은 100m 단위로 끊어 읽기 쉽게 한다.
 *
 * 100m 미만을 따로 두는 이유: 반올림하면 "0m"가 나오는데, 씨네드쉐프 3곳이
 * 본관과 좌표가 완전히 같아 실제로 거리 0이 계산된다(압구정·용산·센텀).
 * 좌표가 같다고 같은 건물이라 단정할 수는 없으므로 "같은 건물"이라고는 쓰지
 * 않고, 확실히 말할 수 있는 범위만 밝힌다.
 */
export function formatDistance(km: number): string {
  if (km < 0.1) return '100m 이내';
  if (km < 1) return `${Math.round(km * 10) * 100}m`;
  return `${km.toFixed(1)}km`;
}
