import type { Branch } from './types';

/**
 * 주차 원문에서 "결국 얼마 내고 어떻게 인증하나"만 뽑아낸다.
 *
 * 각 브랜드 공식 사이트의 주차 안내는 층별 진입 동선·예외 조항까지 한 덩어리
 * 문장으로 되어 있어서, 그대로 옮기면 정작 알고 싶은 무료시간과 초과요금이
 * 문단 속에 묻힌다. 용산아이파크몰 CGV는 주차 안내가 열 줄이 넘는데 "3시간
 * 무료, 이후 10분당 1,500원"이라는 핵심은 그 안에 흩어져 있다.
 *
 * ⚠️ 원문에 문자 그대로 있는 값만 뽑는다. 추정하거나 계산해서 채우지 않고,
 * 못 찾은 항목은 그 줄을 아예 만들지 않는다. 주차 요금은 틀리면 사용자가 돈을
 * 더 내는 정보라서 비어 있는 편이 그럴듯한 오답보다 낫다.
 */

export interface ParkingSummary {
  /** "3시간" — 무료로 대는 시간 */
  free?: string;
  /** "3시간 5,000원" — 무료가 아니라 할인 정액인 지점(강남 CGV 등) */
  flat?: string;
  /** "10분당 1,500원" — 무료·정액 시간을 넘겼을 때 */
  overage?: string;
  /** "티켓판매기 · 매표소" — 주차 인증 수단 */
  verify?: string;
}

const NEWLINE = '\n';

/** "■ 주차 요금 …" 같은 구간을 제목으로 골라 본문만 돌려준다 */
function sectionByTitle(raw: string | null, test: RegExp): string | null {
  if (!raw) return null;
  const chunks = raw
    .split('■')
    .map((c) => c.trim())
    .filter(Boolean);
  // "■"가 없으면 통째로 한 덩어리라 구간을 특정할 수 없다
  if (chunks.length < 2) return null;
  const hit = chunks.find((c) => test.test(c.split(NEWLINE)[0]));
  if (!hit) return null;
  return hit.split(NEWLINE).slice(1).join(NEWLINE).trim() || null;
}

const VERIFY_LABELS: [RegExp, string][] = [
  [/티켓판매기|발권기/, '티켓판매기'],
  [/키오스크/, '키오스크'],
  [/매표소|매점/, '매표소'],
  [/\bAPP\b|앱|어플/i, '모바일 앱'],
  [/(영화|관람)?\s*티켓\s*(제시|인증)/, '영화 티켓 제시'],
  [/주차안내요원|안내요원|현장\s*정산/, '현장 직원'],
  [/무인정산|자동정산|정산기/, '무인정산기'],
];

/** 시간·요금 조합 앞에 붙으면 "기본값이 아니라 조건부 혜택"이라는 뜻 */
const CONDITIONAL = /(최대|합산|추가|구매|이후|이전)\s*$/;

export function parkingSummary(branch: Branch): ParkingSummary | null {
  const p = branch.parking;
  // CGV는 raw 한 덩어리, 롯데·메가박스는 항목별 필드로 들어온다
  const feeText = p.fee ?? sectionByTitle(p.raw, /요금|비용/) ?? '';
  const verifyText = p.howTo ?? sectionByTitle(p.raw, /확인|인증|정산|등록/) ?? '';

  const summary: ParkingSummary = {};

  /*
   * 한 지점 안에 시간·요금 조합이 여럿 적힌 경우가 있고, 성격이 두 가지다.
   *
   *  (1) 조건부 추가 혜택 — 용산아이파크몰 "3시간 무료" + "타매장 합산 최대 5시간".
   *      기본값이 분명하므로 조건부 쪽만 걷어내면 된다.
   *  (2) 조건마다 값이 다름 — 코엑스 메가박스 "22시 이전 종료 4시간 4,800원 /
   *      22시 이후 입차 4시간 무료". 하나만 뽑으면 나머지 조건의 손님이 틀린
   *      안내를 받으므로 요금 요약을 아예 만들지 않는다.
   */
  const combos = [
    ...feeText.matchAll(/(\d+)\s*시간\s*(\d+\s*분\s*)?(?:이내\s*)?(무료|[\d,]+\s*원)/g),
  ].filter((m) => {
    const at = m.index ?? 0;
    if (CONDITIONAL.test(feeText.slice(Math.max(0, at - 14), at))) return false;
    // "10분 초과 시 1,500원 부과(1시간 9,000원)"의 괄호 안 값은 초과요금을
    // 시간당으로 환산한 표기지 기본요금이 아니다. 다만 "3시간 30분 무료주차
    // :초과 시 10분당 1,000원"처럼 기본과 초과가 한 줄에 오는 지점이 있어서
    // 줄 전체를 버리면 기본요금까지 잃는다 — 매칭보다 앞쪽만 본다.
    const lineStart = feeText.lastIndexOf(NEWLINE, at) + 1;
    return !/(초과|부과)/.test(feeText.slice(lineStart, at));
  });

  const distinct = new Set(
    combos.map((m) => `${m[1]}|${(m[2] ?? '').trim()}|${m[3].replace(/\s/g, '')}`),
  );
  if (distinct.size === 1) {
    const m = combos[0];
    const hours = `${m[1]}시간${m[2] ? ` ${m[2].replace(/\s/g, '')}` : ''}`;
    if (m[3].startsWith('무료')) summary.free = hours;
    else summary.flat = `${hours} ${m[3].replace(/\s/g, '')}`;
  }

  // "10분 당 1,000원" / "10분당 500원" — 띄어쓰기가 지점마다 다르다
  const over =
    feeText.match(/(\d+)\s*분\s*당\s*([\d,]+)\s*원/) ??
    feeText.match(/(\d+)\s*분\s*초과[^\d]{0,12}([\d,]+)\s*원/);
  if (over) summary.overage = `${over[1]}분당 ${over[2]}원`;

  const methods = VERIFY_LABELS.filter(([re]) => re.test(verifyText)).map(([, label]) => label);
  if (methods.length > 0) summary.verify = methods.join(' · ');

  return Object.keys(summary).length > 0 ? summary : null;
}
