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

/**
 * 요약이 이미 담은 줄을 원문에서 걷어낸다.
 *
 * 요약을 카드 위에 얹으면서 같은 사실이 페이지에 두 번 나오게 됐다 — "3시간
 * 무료, 10분당 1,500원"이 요약에도 있고 바로 아래 원문 카드에도 있다. 중복은
 * 읽는 사람에게 군더더기이고, 공식 사이트 문장을 그대로 싣는 분량만 늘린다.
 *
 * 줄 단위로만 지운다. "2편 이상 관람 시에도 최대 3시간", "타매장 합산 5시간"
 * 처럼 요약에 담기지 않은 예외 조항은 원문에서만 볼 수 있으므로 남겨야 한다.
 */
export function dropSummarizedLines(body: string, summary: ParkingSummary | null): string {
  if (!summary) return body;

  const values = [summary.free, summary.flat, summary.overage].filter(
    (v): v is string => Boolean(v),
  );
  if (values.length === 0) return body;

  // "10분당 1,500원" → "10분", "1,500원" 처럼 원문 표기 흔들림을 견디게 쪼갠다
  const needles = values.map((v) => v.split(/\s+/).filter(Boolean));

  return body
    .split(NEWLINE)
    .filter((line) => {
      const bare = line.replace(/\s/g, '');
      // 요약값의 조각이 모두 들어 있고, 그 줄에 요약 밖 정보(최대·합산 등 예외)가
      // 없을 때만 중복으로 본다
      const isDuplicate = needles.some((parts) =>
        parts.every((p) => bare.includes(p.replace(/\s/g, ''))),
      );
      return !isDuplicate || /(최대|합산|추가|이상|미관람|이외|단,|※)/.test(line);
    })
    .join(NEWLINE)
    .trim();
}

export interface ParkingGroup {
  label: string;
  items: string[];
}

/** 원문 한 줄이 어떤 사실을 말하는지 — 앞에 오는 규칙이 이긴다 */
const LINE_CATEGORIES: [string, RegExp][] = [
  ['다른 매장 합산', /합산|타\s*매장|타매장|제휴|백화점|아울렛|마트/],
  ['주차 인증', /인증|정산|티켓\s*제시|판매기|키오스크|앱|APP|어플|바코드|주차권/i],
  ['초과 요금', /초과|분\s*당|분당/],
  ['무료 주차', /무료|원\b|[\d,]+\s*원/],
  ['주의사항', /협소|권장|부탁|불가|제한|변경|주의|만차|혼잡|※/],
  ['주차 위치', /주차장|층|건물|진입|이동|입구|엘리베이터|E\/V|위치|지하|지상/],
];

const GROUP_ORDER = [
  '주차 위치',
  '무료 주차',
  '초과 요금',
  '주차 인증',
  '다른 매장 합산',
  '주의사항',
  '그 밖의 안내',
];

/**
 * 주차 원문을 사실 항목별로 다시 묶는다.
 *
 * 공식 사이트의 주차 안내는 "■ 주차안내 / ■ 주차확인 / ■ 주차요금" 세 덩어리로
 * 오는데, 그 안에 위치·요금·인증·예외가 뒤섞여 있다. 그대로 옮기면 공식 문장을
 * 통째로 싣는 셈이고, 읽는 쪽에서도 필요한 줄을 직접 찾아야 한다.
 *
 * 그래서 줄 단위로 무엇을 말하는 문장인지 분류해 항목별로 다시 세운다.
 * ⚠️ 문장을 새로 쓰지 않는다 — 원문 줄을 그대로 두되 어느 항목에 속하는지만
 * 붙인다. 지어낸 문장이 섞이면 확인되지 않은 정보를 사실처럼 내보내게 된다.
 *
 * 정규화된 값(무료시간·초과요금·인증수단)은 parkingSummary가 뽑아둔 것을 각
 * 항목의 첫 줄로 올려, 긴 원문을 읽지 않아도 답이 먼저 보이게 한다.
 */
export function parkingGroups(branch: Branch): ParkingGroup[] {
  const p = branch.parking;
  const sources = [p.raw, p.guide, p.howTo, p.fee].filter(Boolean) as string[];
  if (sources.length === 0) return [];

  const raw = sources
    .join(NEWLINE)
    .split(NEWLINE)
    .map((l) => l.replace(/^[\s■\-●•○★ㆍ:]+/, '').trim())
    // "■ 주차 확인(인증 방법)" 같은 구간 제목은 이제 우리가 붙이는 항목명이
    // 대신하므로 항목으로 들어가면 안 된다. 뒤에 괄호 설명만 붙은 형태까지 잡는다.
    .filter((l) => l.length > 1 && !/^주차\s*(안내|확인|요금|위치)\s*[(（]?[^)）]*[)）]?$/.test(l));

  // 원문이 한 문장을 여러 줄로 흘려 쓴 곳이 있다("… 제한될 수 있으며," / "… 변경될
  // 수 있습니다.)"). 괄호가 안 닫혔거나 쉼표로 끝나면 다음 줄과 이어 붙인다.
  const lines: string[] = [];
  for (const line of raw) {
    const prev = lines[lines.length - 1];
    const open = prev ? (prev.match(/[(（]/g) ?? []).length - (prev.match(/[)）]/g) ?? []).length : 0;
    if (prev && (open > 0 || /[,·]$/.test(prev))) lines[lines.length - 1] = `${prev} ${line}`;
    else lines.push(line);
  }

  const buckets = new Map<string, string[]>();
  const push = (label: string, value: string) => {
    const list = buckets.get(label) ?? [];
    // 같은 사실이 여러 필드에 중복으로 들어온 지점이 있다
    if (!list.some((v) => v.replace(/\s/g, '') === value.replace(/\s/g, ''))) list.push(value);
    buckets.set(label, list);
  };

  const summary = parkingSummary(branch);
  if (summary?.free) push('무료 주차', `영화 관람 시 ${summary.free} 무료`);
  if (summary?.flat) push('무료 주차', `영화 관람 시 ${summary.flat}`);
  if (summary?.overage) push('초과 요금', summary.overage);
  if (summary?.verify) push('주차 인증', summary.verify);

  // 정규화된 값이 이미 말한 사실을 원문으로 한 번 더 싣지 않는다. 다만 원문
  // 줄에 값 말고 다른 정보가 함께 있으면(예외 조항 등) 남긴다.
  const normalized = [summary?.free, summary?.flat, summary?.overage]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.split(/\s+/).filter(Boolean).map((t) => t.replace(/\s/g, '')));

  for (const line of lines) {
    const bare = line.replace(/\s/g, '');
    const isEcho =
      normalized.some((parts) => parts.every((t) => bare.includes(t))) &&
      !/(최대|합산|추가|이상|미관람|이외|단,|※|\()/.test(line);
    if (isEcho) continue;

    const hit = LINE_CATEGORIES.find(([, re]) => re.test(line));
    push(hit ? hit[0] : '그 밖의 안내', line);
  }

  return GROUP_ORDER.filter((label) => buckets.get(label)?.length).map((label) => ({
    label,
    items: buckets.get(label)!,
  }));
}
