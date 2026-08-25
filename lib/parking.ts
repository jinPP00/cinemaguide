import type { Branch } from './types';

/**
 * 공식 영화관 주차 안내를 화면용 사실 데이터로 바꾼다.
 *
 * 원문은 근거 데이터로만 보관하고 화면에는 그대로 출력하지 않는다.
 * 숫자·시간·주차장 구분처럼 확실히 읽을 수 있는 값만 뽑아 CinemaGuide의
 * 표준 문장으로 다시 만든다. 애매한 문장은 보여주지 않는 것이 원칙이다.
 */

export interface ParkingSummary {
  free?: string;
  flat?: string;
  overage?: string;
  verify?: string;
}

export interface ParkingGroup {
  label: string;
  items: string[];
}

const GROUP_ORDER = [
  '주차 위치',
  '운영 시간',
  '주차 규모',
  '무료 주차',
  '초과 요금',
  '주차 인증',
  '다른 매장 합산',
  '주의사항',
] as const;

type GroupLabel = (typeof GROUP_ORDER)[number];

/** HTML 엔티티·마커 때문에 여러 사실이 한 줄로 붙는 것을 먼저 분리한다. */
function sourceText(branch: Branch): string {
  const p = branch.parking;
  return [p.raw, p.guide, p.howTo, p.fee]
    .filter(Boolean)
    .join('\n')
    .replace(/&nbsp;|&#160;/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/&amp;/gi, '&')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    // "(1) ... (2) ..."가 한 줄에 이어진 원문을 사실 단위로 나눈다.
    .replace(/\s*\((\d{1,2})\)\s*/g, '\n')
    // 공식 사이트의 시각적 불릿도 줄 구분자로 취급한다.
    .replace(/[■●•○★ㆍ]+/g, '\n');
}

function stripLine(line: string): string {
  return line
    .replace(/^\s*[-:：]+\s*/, '')
    .replace(/^\d{1,2}[.)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function linesOf(branch: Branch): string[] {
  return sourceText(branch)
    .split('\n')
    .map(stripLine)
    .filter((line) => line.length > 1)
    // 원문의 구간 제목은 화면의 고정 라벨이 대신한다.
    .filter((line) => !/^주차\s*(안내|장\s*안내|확인|요금|위치|적용\s*안내)\s*[(（]?[^)）]*[)）]?$/.test(line));
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function clock(hour: number, minute = 0, period?: string): string {
  let h = hour;
  if (period === '오후' && h < 12) h += 12;
  if (period === '오전' && h === 12) h = 0;
  return `${pad2(h)}:${pad2(minute)}`;
}

function normalizeTimes(text: string): string {
  return text
    .replace(/(오전|오후|새벽)\s*(\d{1,2})\s*시\s*(\d{1,2})?\s*분?/g, (_m, p, h, min) =>
      clock(Number(h), min ? Number(min) : 0, p),
    )
    .replace(/(?<!\d)(\d{1,2})\s*시\s*(\d{1,2})\s*분/g, (_m, h, min) =>
      clock(Number(h), Number(min)),
    )
    .replace(/\s*~\s*/g, '~')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeFloors(text: string): string {
  return text
    .replace(/지하\s*(\d+)\s*층/g, 'B$1')
    .replace(/지상\s*(\d+)\s*층/g, '$1F')
    .replace(/\bB(\d+)F\b/gi, 'B$1')
    .replace(/\b(\d+)F\b/g, '$1F')
    .replace(/B(\d+)\s*~\s*B(\d+)/g, 'B$1~B$2')
    .replace(/(\d+)F\s*~\s*(\d+)F/g, '$1F~$2F')
    .replace(/\s+/g, ' ')
    .trim();
}

function duration(m: RegExpMatchArray): string {
  return `${m[1]}시간${m[2] ? ` ${m[2].replace(/\s/g, '')}` : ''}`;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/**
 * 무료시간은 숫자가 하나로 확정될 때만 요약한다.
 * 같은 지점에 3시간/2시간처럼 서로 다른 값이 있으면 조건을 잃은 숫자를 두 줄로
 * 보여주는 대신 요약을 만들지 않는다.
 */
function freeDurations(text: string): string[] {
  const values: string[] = [];
  for (const m of text.matchAll(/(\d+)\s*시간\s*(\d+\s*분\s*)?(?:이내\s*)?무료/g)) {
    const at = m.index ?? 0;
    const before = text.slice(Math.max(0, at - 14), at);
    if (/(최대|합산|추가|구매)/.test(before)) continue;
    values.push(duration(m));
  }
  return unique(values);
}

function flatDiscounts(text: string): string[] {
  const values: string[] = [];
  for (const line of text.split('\n')) {
    if (/초과|부과|분당/.test(line)) continue;
    const m = line.match(/(\d+)\s*시간\s*([\d,]+)\s*원/);
    if (m) values.push(`${m[1]}시간 ${m[2]}원`);
  }
  return unique(values);
}

function overageRates(text: string): string[] {
  const values: string[] = [];
  for (const m of text.matchAll(/(\d+)\s*분\s*(?:당|초과[^\d]{0,12})\s*([\d,]+)\s*원/g)) {
    values.push(`${m[1]}분당 ${m[2]}원`);
  }
  return unique(values);
}

function verificationMethods(text: string): string[] {
  const methods: string[] = [];
  if (/티켓판매기|발권기/.test(text)) methods.push('티켓판매기');
  if (/키오스크/.test(text)) methods.push('키오스크');
  if (/매표소|매점/.test(text)) methods.push('매표소');
  if (/\bAPP\b|앱|어플/i.test(text)) methods.push('모바일 앱');
  if (/무인\s*정산|자동\s*정산|주차\s*정산기|정산기/.test(text)) methods.push('주차 정산기');
  if (/(영화|관람)?\s*티켓\s*(제시|확인|인증)/.test(text)) methods.push('영화 티켓');
  if (/주차안내요원|안내요원|현장\s*정산/.test(text)) methods.push('현장 직원');
  return unique(methods);
}

export function parkingSummary(branch: Branch): ParkingSummary | null {
  const text = sourceText(branch);
  const summary: ParkingSummary = {};

  const free = freeDurations(text);
  if (free.length === 1) summary.free = free[0];

  const flat = flatDiscounts(text);
  if (!summary.free && flat.length === 1) summary.flat = flat[0];

  const overage = overageRates(text);
  if (overage.length === 1) summary.overage = overage[0];

  const verify = verificationMethods(text);
  if (verify.length > 0) summary.verify = verify.join(' · ');

  return Object.keys(summary).length > 0 ? summary : null;
}

/** 이전 코드에서 참조하던 API와의 호환용. 원문은 더 이상 화면에 렌더링하지 않는다. */
export function dropSummarizedLines(body: string, _summary: ParkingSummary | null): string {
  return body;
}

function contextForLine(line: string): string | null {
  if (/본관/.test(line)) return '본관';
  if (/별관/.test(line)) return '별관';
  if (/지하\s*주차장|지하주차장/.test(line)) return '지하주차장';
  if (/지상\s*주차장|지상주차장/.test(line)) return '지상주차장';
  if (/평일/.test(line)) return '평일';
  if (/주말|공휴일/.test(line)) return '주말·공휴일';
  return null;
}

/** 위치는 이름과 층 범위를 모두 확실히 읽을 수 있을 때만 만든다. */
function locationFacts(lines: string[]): string[] {
  const result: string[] = [];
  for (const raw of lines) {
    const line = normalizeFloors(raw);
    for (const name of ['본관', '별관', '지하주차장', '지상주차장']) {
      const re = new RegExp(`${name}[^,;]{0,35}?(B\\d+(?:~(?:B\\d+|\\d+F))?|\\d+F(?:~\\d+F)?)`);
      const m = line.match(re);
      if (m) result.push(`${name} ${m[1]}`);
    }
  }
  return unique(result);
}

function operationFacts(lines: string[]): string[] {
  const result: string[] = [];
  for (const raw of lines) {
    const line = normalizeTimes(raw);
    const range = line.match(/(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/);
    if (!range) continue;
    if (!/(입차|운영|이용|오전|오후|새벽|시간)/.test(raw)) continue;

    const context = contextForLine(raw);
    let value = `${range[1]}~${range[2]}`;
    const weekend = line.match(/주말[^\d]{0,10}(\d{2}:\d{2})\s*까지/);
    if (weekend) value += ` · 주말 ${weekend[1]}까지`;
    result.push(context ? `${context} ${value}` : value);
  }
  return unique(result);
}

function capacityFacts(text: string): string[] {
  // 총계가 있으면 부분 주차장 대수보다 우선한다.
  const total = text.match(/(?:총|합계)\s*[:：]?\s*([\d,]+)\s*(여)?\s*대/);
  if (total) return [`총 ${total[1]}대`];

  const values: string[] = [];
  for (const m of text.matchAll(/(?:주차\s*가능|주차\s*규모)?\s*[:：]?\s*(약\s*)?([\d,]+)\s*(여)?\s*대/g)) {
    const approx = m[1] || m[3] ? '약 ' : '';
    values.push(`${approx}${m[2]}대`);
  }
  return unique(values).slice(0, 2);
}

function combinedFacts(text: string): string[] {
  const values: string[] = [];
  for (const line of text.split('\n')) {
    if (!/(타\s*매장|타매장|다른\s*매장|백화점|마트|아울렛)/.test(line)) continue;
    if (!/(합산|포함|추가)/.test(line)) continue;
    const m = line.match(/최대\s*(\d+)\s*시간/);
    if (m) values.push(`다른 매장 이용분과 합산해 최대 ${m[1]}시간 할인`);
  }
  return unique(values);
}

function warningFacts(text: string, freeValues: string[]): string[] {
  const values: string[] = [];

  // 서로 다른 무료시간이 있으면 조건을 떼어낸 숫자를 나열하지 않는다.
  if (freeValues.length > 1) {
    values.push('무료 주차 시간이 이용 조건에 따라 다름 · 공식 페이지에서 적용 조건 확인');
  }

  if (/1일\s*1회/.test(text) && /재입차/.test(text)) {
    values.push('주차 할인은 하루 1회 · 재입차 시 요금 부과');
  } else if (/재입차/.test(text) && /(할인\s*불가|요금\s*발생|정상\s*요금)/.test(text)) {
    values.push('출차 후 재입차 시 할인 미적용');
  }

  if (/카드\s*결제만\s*가능/.test(text)) values.push('주차요금 결제는 카드만 가능');
  if (/주차장.*협소|주차\s*공간.*협소/.test(text)) {
    values.push(/대중교통/.test(text) ? '주차 공간 협소 · 대중교통 이용 권장' : '주차 공간이 협소함');
  }

  return unique(values);
}

function push(map: Map<GroupLabel, string[]>, label: GroupLabel, values: string[]) {
  if (values.length === 0) return;
  const current = map.get(label) ?? [];
  for (const value of values) {
    if (!current.includes(value)) current.push(value);
  }
  map.set(label, current);
}

export function parkingGroups(branch: Branch): ParkingGroup[] {
  const text = sourceText(branch);
  if (!text.trim()) return [];

  const lines = linesOf(branch);
  const groups = new Map<GroupLabel, string[]>();

  push(groups, '주차 위치', locationFacts(lines));
  push(groups, '운영 시간', operationFacts(lines));
  push(groups, '주차 규모', capacityFacts(text));

  const free = freeDurations(text);
  if (free.length === 1) push(groups, '무료 주차', [`영화 관람 시 ${free[0]} 무료`]);

  const flat = flatDiscounts(text);
  if (free.length === 0 && flat.length === 1) {
    push(groups, '무료 주차', [`영화 관람 할인 · ${flat[0]}`]);
  }

  const overage = overageRates(text);
  if (overage.length === 1) push(groups, '초과 요금', overage);

  const verify = verificationMethods(text);
  if (verify.length > 0) push(groups, '주차 인증', [`${verify.join(' · ')} 이용`]);

  push(groups, '다른 매장 합산', combinedFacts(text));
  push(groups, '주의사항', warningFacts(text, free));

  return GROUP_ORDER.filter((label) => groups.get(label)?.length).map((label) => ({
    label,
    items: groups.get(label)!,
  }));
}
