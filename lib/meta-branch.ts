import { baseFare, won } from './fares';
import { parkingSummary } from './parking';
import { withJosa } from './josa';
import type { Branch } from './types';

/**
 * 지점 페이지의 title·h1·description.
 *
 * 두 가지를 고친 자리다.
 *
 * 1) 예전 제목은 "{지점} 상영시간표·주차·관람료 안내"로 상영시간표가 맨 앞에
 *    있었다. 이 사이트는 실시간 상영시간표를 제공하지 않고 공식 페이지로
 *    보내기만 하므로, 검색 결과에서 시간표를 볼 수 있다고 오해하게 만든다.
 *    키워드를 버리지는 않되 실제로 제공하는 것을 앞에 두고, 시간표는 "확인"
 *    이라는 행동으로 뒤에 붙인다.
 *
 * 2) description이 지점 이름만 바뀌고 문장은 425개가 똑같았다. 요금·주차·특별관
 *    가운데 그 지점에 실제로 있는 값만 골라 넣어 페이지마다 다르게 만든다.
 *    없는 항목은 문장을 만들지 않는다 — 실제로 제공하지 않는 정보를 설명에
 *    넣으면 클릭한 사람이 찾지 못한다.
 */

/**
 * 휴관·폐점 지점은 제목부터 다르게 쓴다. "관람료·주차 안내"라는 제목으로
 * 갈 수 없는 극장 페이지가 검색결과에 남으면 제목 자체가 틀린 정보가 된다.
 * (색인은 lib/data.ts의 isIndexable이 이미 막지만, 링크로 들어온 사람과
 * 공유 미리보기에도 같은 제목이 쓰인다.)
 */
function closedLabel(branch: Branch): string | null {
  if (branch.status === '폐점') return '영업 종료';
  if (branch.status === '휴관') return '휴관';
  return null;
}

export function branchTitle(branch: Branch): string {
  const closed = closedLabel(branch);
  if (closed) return `${branch.name} ${branch.brandName} ${closed} 안내`;
  // 레이아웃이 " | 영화관 지점안내"를 뒤에 붙이므로 여기서는 짧게 둔다 —
  // 한국어 검색결과 제목은 30자 언저리에서 잘린다.
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
    return `${withJosa(full, '은')} 현재 ${closed} 상태입니다. 위치와 근처에서 대신 갈 수 있는 영화관을 정리했습니다.`;
  }
  const facts: string[] = [];

  const fare = baseFare(branch);
  if (fare) {
    facts.push(`평일 성인 ${won(fare.weekdayAdult)}·주말 ${won(fare.weekendAdult)}`);
  }

  const parking = parkingSummary(branch);
  if (parking?.free) facts.push(`주차 ${parking.free} 무료`);
  else if (parking?.flat) facts.push(`주차 ${parking.flat}`);

  if (branch.specialScreens.length > 0) {
    facts.push(`특별관 ${branch.specialScreens.slice(0, 2).join('·')}`);
  }

  const head = facts.length > 0 ? `${full} ${facts.join(', ')}. ` : `${full} 안내. `;
  return `${head}${branch.sido} 지역 요금 비교와 근처 영화관, 가는 길을 함께 정리했습니다. 공식 상영시간표로 바로 이동할 수 있습니다.`;
}
