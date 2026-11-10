import { baseFare, won } from './fares';
import { parkingSummary } from './parking';
import { withJosa } from './josa';
import type { Branch } from './types';

/**
 * 지점 페이지의 title·h1·description.
 *
 * 1) 실시간 상영시간표를 직접 제공하지 않고 공식 페이지로 연결하므로,
 *    실제로 제공하는 관람료·주차 정보를 앞에 두고 시간표는 뒤에 배치한다.
 * 2) description은 그 지점에 실제로 있는 요금·주차·특별관 값을 조합해
 *    페이지마다 고유하게 만들되, 네이버 서치어드바이저 및 검색 스니펫 기준인
 *    40~80자 이내를 넘지 않도록 길이를 제어한다.
 */

function closedLabel(branch: Branch): string | null {
  if (branch.status === '폐점') return '영업 종료';
  if (branch.status === '휴관') return '휴관';
  return null;
}

export function branchTitle(branch: Branch): string {
  const closed = closedLabel(branch);
  if (closed) return `${branch.name} ${branch.brandName} ${closed} 안내`;
  return `${branch.name} ${branch.brandName} 관람료·주차 | 상영시간표`;
}

export function branchHeading(branch: Branch): string {
  const closed = closedLabel(branch);
  if (closed) return `${branch.name} ${branch.brandName} ${closed} 안내`;
  return `${branch.name} ${branch.brandName} 관람료·주차 안내`;
}

export function branchDescription(branch: Branch): string {
  const full = `${branch.name} ${branch.brandName}`;
  const closed = closedLabel(branch);
  if (closed) {
    const msg = `${withJosa(full, '은')} 현재 ${closed} 상태예요. 위치와 근처 대안 영화관을 안내해요.`;
    return msg.length <= 80 ? msg : `${full} ${closed} 안내 및 근처 대안 영화관 위치·거리 정보.`;
  }

  const facts: string[] = [];

  const fare = baseFare(branch);
  if (fare) {
    facts.push(`평일 ${won(fare.weekdayAdult)}·주말 ${won(fare.weekendAdult)}`);
  }

  const parking = parkingSummary(branch);
  if (parking?.free) facts.push(`주차 ${parking.free} 무료`);
  else if (parking?.flat) facts.push(`주차 ${parking.flat}`);

  if (branch.specialScreens.length > 0) {
    facts.push(branch.specialScreens[0]);
  }

  const tail = '가는 길·공식 상영시간표 안내.';
  const build = (list: string[]) =>
    list.length > 0
      ? `${full} ${list.join(', ')}. ${tail}`
      : `${full} 주소, 주차 조건, 관람료, 가는 길과 공식 상영시간표를 안내해요.`;

  const chosen = [...facts];
  while (chosen.length > 1 && build(chosen).length > 80) {
    chosen.pop();
  }

  let result = build(chosen);
  if (result.length < 40) {
    result = `${full} ${chosen.join(', ')}, 관람료, 가는 길과 공식 상영시간표를 안내해요.`;
  }
  if (result.length > 80) {
    result = `${full} 관람료, 주차, 가는 길과 공식 상영시간표 안내.`;
  }
  return result;
}
