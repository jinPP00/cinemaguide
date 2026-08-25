import type { Branch } from './types';

/**
 * 공식 영화관 주차 안내를 화면용 사실 데이터로 바꾼다.
 *
 * 원문은 출처 확인용 데이터에만 남겨두고 화면에는 그대로 출력하지 않는다.
 * 위치·운영시간·주차대수·무료시간·초과요금·인증·합산·주의사항처럼
 * 패턴으로 확인할 수 있는 사실만 표준 표현으로 다시 만든다.
 *
 * 원칙
 * - 숫자·장소·조건을 새로 추정하지 않는다.
 * - 원문을 그대로 화면에 내보내지 않는다.
 * - 확실하게 재구성하지 못한 줄은 표시하지 않는다.
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

const NEWLINE = '\n';

function sectionByTitle(raw: string | null, test: RegExp): string | null {
  if (!raw) return null;
  const chunks = raw
    .split('■')
    .map((c) => c.trim())
    .filter(Boolean);
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
  [/(영화|관람)?\s*티켓\s*(제시|인증|확인)/, '영화 티켓'],
  [/주차안내요원|안내요원|현장\s*정산/, '현장 직원'],
  [/무인정산|자동정산|정산기/, '주차 정산기'],
];

const CONDITIONAL = /(최대|합산|추가|구매|이후|이전)\s*$/;

/** 화면 상단 요약용. 섹션 제목이 불규칙한 지점 때문에 전체 원문도 보조로 본다. */
export function parkingSummary(branch: Branch): ParkingSummary | null {
  const p = branch.parking;
  const allText = [p.raw, p.guide, p.howTo, p.fee].filter(Boolean).join(NEWLINE);
  const feeText = p.fee ?? sectionByTitle(p.raw, /요금|비용|적용/) ?? allText;
  const verifyText = p.howTo ?? sectionByTitle(p.raw, /확인|인증|정산|등록|적용/) ?? allText;
  const summary: ParkingSummary = {};

  const combos = [
    ...feeText.matchAll(/(\d+)\s*시간\s*(\d+\s*분\s*)?(?:이내\s*)?(무료|[\d,]+\s*원)/g),
  ].filter((m) => {
    const at = m.index ?? 0;
    if (CONDITIONAL.test(feeText.slice(Math.max(0, at - 14), at))) return false;
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

  const over =
    feeText.match(/(\d+)\s*분\s*당\s*([\d,]+)\s*원/) ??
    feeText.match(/(\d+)\s*분\s*초과[^\d]{0,12}([\d,]+)\s*원/) ??
    feeText.match(/초과\s*요금[^\d]*(\d+)\s*분\s*[-:：]?\s*([\d,]+)\s*원/);
  if (over) summary.overage = `${over[1]}분당 ${over[2]}원`;

  const methods = [...new Set(VERIFY_LABELS.filter(([re]) => re.test(verifyText)).map(([, label]) => label))];
  if (methods.length > 0) summary.verify = methods.join(' · ');

  return Object.keys(summary).length > 0 ? summary : null;
}

/** 이전 코드와의 호환용. 이제 화면에서는 원문 자체를 렌더링하지 않는다. */
export function dropSummarizedLines(body: string, summary: ParkingSummary | null): string {
  if (!summary) return body;
  const values = [summary.free, summary.flat, summary.overage].filter(
    (v): v is string => Boolean(v),
  );
  if (values.length === 0) return body;
  const needles = values.map((v) => v.split(/\s+/).filter(Boolean));
  return body
    .split(NEWLINE)
    .filter((line) => {
      const bare = line.replace(/\s/g, '');
      const isDuplicate = needles.some((parts) =>
        parts.every((p) => bare.includes(p.replace(/\s/g, ''))),
      );
      return !isDuplicate || /(최대|합산|추가|이상|미관람|이외|단,|※)/.test(line);
    })
    .join(NEWLINE)
    .trim();
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
];

const clean = (s: string) => s.replace(/\s+/g, '').replace(/[.,·:：()\[\]{}'"※]/g, '');

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function clock(hour: number, minute = 0, period?: '오전' | '오후' | '새벽'): string {
  let h = hour;
  if (period === '오후' && h < 12) h += 12;
  if (period === '오전' && h === 12) h = 0;
  return `${pad2(h)}:${pad2(minute)}`;
}

/** 오전 5시 / 오후 9시 / 새벽2시 같은 표현을 05:00 / 21:00 / 02:00으로 통일한다. */
function normalizeTimes(text: string): string {
  let out = text;
  out = out.replace(/(오전|오후|새벽)\s*(\d{1,2})\s*시\s*(\d{1,2})?\s*분?/g, (_m, p, h, min) =>
    clock(Number(h), min ? Number(min) : 0, p),
  );
  out = out.replace(/(?<!\d)(\d{1,2})\s*시\s*(\d{1,2})\s*분/g, (_m, h, min) =>
    clock(Number(h), Number(min)),
  );
  return out
    .replace(/\s*~\s*/g, '~')
    .replace(/\s*까지/g, '까지')
    .replace(/주말\s*[:：]\s*/g, '주말 ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 층 표기를 B2 / 4F처럼 짧게 통일한다. */
function normalizeFloors(text: string): string {
  return text
    .replace(/지하\s*(\d+)\s*층/g, 'B$1')
    .replace(/지상\s*(\d+)\s*층/g, '$1F')
    .replace(/(B\d+)\s*~\s*(B\d+)/g, '$1~$2')
    .replace(/(\d+F)\s*~\s*(\d+F)/g, '$1~$2');
}

function stripDecorations(text: string): string {
  return text
    .replace(/^[\s■\-●•○★ㆍ:]+/, '')
    .replace(/^\d{1,2}\.\s*/, '')
    .replace(/^\(([^)]+)\)\s*/, '$1 ')
    .trim();
}

function normalizeMoneySpacing(text: string): string {
  return text
    .replace(/([\d,]+)\s*원/g, '$1원')
    .replace(/(\d+)\s*분\s*당/g, '$1분당')
    .replace(/(\d+)\s*시간\s*무료\s*주차/g, '$1시간 무료')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 공식 안내문 문체를 화면용 짧은 사실 표현으로 바꾼다.
 * 아래 치환은 의미를 추가하지 않고 같은 사실의 표현만 통일한다.
 */
function rewriteCommon(text: string): string {
  let out = normalizeFloors(normalizeTimes(normalizeMoneySpacing(stripDecorations(text))));
  out = out
    .replace(/주차가능\s*[:：]?\s*/g, '')
    .replace(/입차\s*가능\s*시간\s*[:：]?\s*/g, '입차 ')
    .replace(/이용\s*가능\s*시간\s*[:：]?\s*/g, '이용 ')
    .replace(/운영\s*시간\s*[:：]?\s*/g, '')
    .replace(/주차장\s*이용\s*문의\s*및\s*불편사항은\s*/g, '')
    .replace(/연락\s*바랍니다\.?/g, '문의')
    .replace(/이용해\s*주시기\s*바랍니다\.?/g, '이용 권장')
    .replace(/이용\s*부탁드립니다\.?/g, '이용 권장')
    .replace(/권장합니다\.?/g, '권장')
    .replace(/가능합니다\.?/g, '가능')
    .replace(/가능합니다/g, '가능')
    .replace(/불가합니다\.?/g, '불가')
    .replace(/필수입니다\.?/g, '필수')
    .replace(/필요합니다\.?/g, '필요')
    .replace(/제시해\s*주세요\.?/g, '제시')
    .replace(/변경될\s*수\s*있습니다\.?/g, '운영 상황에 따라 변경 가능')
    .replace(/제한될\s*수\s*있으며?/g, '제한될 수 있음')
    .replace(/카드결제만\s*가능/g, '카드 결제만 가능')
    .replace(/재입차\s*시/g, '재입차 시')
    .replace(/재입차시/g, '재입차 시')
    .replace(/타매장/g, '다른 매장')
    .replace(/타\s*매장/g, '다른 매장')
    .replace(/셀프\s*할인등록/g, '할인 등록')
    .replace(/할인등록/g, '할인 등록')
    .replace(/무인정산기/g, '무인 정산기')
    .replace(/자동정산기/g, '자동 정산기')
    .replace(/주차정산기/g, '주차 정산기')
    .replace(/영화티켓/g, '영화 티켓')
    .replace(/당일\s*티켓/g, '당일 영화 티켓')
    .replace(/무료주차/g, '무료 주차')
    .replace(/주차요금/g, '주차 요금')
    .replace(/\s*\/\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();
  return out.replace(/[.]$/, '');
}

function inferLabel(original: string, rewritten: string): string | null {
  const text = `${original} ${rewritten}`;
  if (/합산|다른 매장|제휴|백화점|아울렛|마트.*(구매|이용)/.test(text)) return '다른 매장 합산';
  if (/재입차|협소|혼잡|만차|불가|제한|주의|권장|변경|미등록|정상\s*요금|1일\s*1회|하루\s*1회/.test(text)) return '주의사항';
  if (/인증|정산|티켓\s*(제시|확인)|판매기|키오스크|앱|APP|바코드|주차권|할인\s*등록/i.test(text)) return '주차 인증';
  if (/초과|분당|분\s*[-:：]\s*[\d,]+원|시간\s*[-:：]\s*[\d,]+원/.test(text)) return '초과 요금';
  if (/무료|영화\s*관람.*[\d,]+원|\d+시간\s*[\d,]+원/.test(text)) return '무료 주차';
  if (/입차|운영\s*시간|이용\s*시간|24시간|오전|오후|새벽|\d{2}:\d{2}/.test(text)) return '운영 시간';
  if (/\d[\d,]*\s*여?대|주차\s*규모/.test(text)) return '주차 규모';
  if (/주차장|B\d|\dF|건물|진입|입구|엘리베이터|E\/V|위치|사이|지하|지상/.test(text)) return '주차 위치';
  return null;
}

function standardizeFact(originalLine: string): { label: string; value: string } | null {
  const original = stripDecorations(originalLine);
  if (!original) return null;

  // 원문 구간 제목은 화면의 고정 라벨이 대신한다.
  if (/^주차\s*(안내|장\s*안내|확인|요금|위치|적용\s*안내)\s*[(（]?[^)）]*[)）]?$/.test(original)) return null;
  // "지하주차장"처럼 다음 줄들의 소제목 역할만 하는 한 단어는 별도 사실이 아니다.
  if (/^(지하|지상|기계식)?\s*주차장$/.test(original)) return null;

  // 주차 대수는 문장을 다시 만들지 않고 값만 표준화한다.
  const capacity = original.match(/(?:주차\s*가능\s*[:：]?\s*)?(약\s*)?([\d,]+)\s*(여)?\s*대/);
  if (capacity && original.length < 45) {
    const approx = capacity[1] || capacity[3] ? '약 ' : '';
    return { label: '주차 규모', value: `${approx}${capacity[2]}대` };
  }

  // 입차/운영시간은 키워드와 시간값만 재구성한다.
  const timeLine = original.match(/(?:입차\s*가능\s*시간|운영\s*시간|이용\s*시간)\s*[:：]?\s*(.+)$/);
  if (timeLine) return { label: '운영 시간', value: normalizeTimes(timeLine[1]) };
  if (/24\s*시간\s*운영/.test(original)) return { label: '운영 시간', value: '24시간 운영' };

  // 여러 초과요금이 한 줄에 있는 경우 숫자 조합만 다시 묶는다.
  if (/초과\s*요금/.test(original)) {
    const pairs = [...original.matchAll(/(\d+)\s*(분|시간)\s*[-:：]?\s*([\d,]+)\s*원/g)];
    if (pairs.length > 0) {
      return {
        label: '초과 요금',
        value: pairs.map((m) => `${m[1]}${m[2]} ${m[3]}원`).join(' · '),
      };
    }
  }

  // 무료시간·정액할인은 확인된 숫자와 조건만 표준 문장으로 만든다.
  const free = original.match(/(\d+)\s*시간\s*(\d+\s*분\s*)?(?:이내\s*)?무료/);
  if (free && !/(최대|합산|추가)/.test(original.slice(Math.max(0, (free.index ?? 0) - 12), free.index))) {
    const duration = `${free[1]}시간${free[2] ? ` ${free[2].replace(/\s/g, '')}` : ''}`;
    const ticket = /티켓|관람/.test(original) ? '영화 관람 시 ' : '';
    return { label: '무료 주차', value: `${ticket}${duration} 무료` };
  }

  const flat = original.match(/(\d+)\s*시간\s*([\d,]+)\s*원/);
  if (flat && !/초과|부과/.test(original)) {
    return { label: '무료 주차', value: `영화 관람 할인 · ${flat[1]}시간 ${flat[2]}원` };
  }

  const perMinute = original.match(/(\d+)\s*분\s*(?:당|초과[^\d]{0,12})\s*([\d,]+)\s*원/);
  if (perMinute) return { label: '초과 요금', value: `${perMinute[1]}분당 ${perMinute[2]}원` };

  // 대표적인 인증 문장을 짧게 재구성한다.
  if (/매표소.*티켓.*(확인|제시)/.test(original)) {
    return { label: '주차 인증', value: '매표소에서 당일 영화 티켓 확인' };
  }
  if (/출차.*영화\s*티켓\s*제시/.test(original)) {
    return { label: '주차 인증', value: '출차 시 영화 티켓 제시' };
  }
  if (/키오스크.*(티켓|바코드).*(인증|인식|할인)/.test(original)) {
    return { label: '주차 인증', value: '주차 키오스크에서 영화 티켓 인증' };
  }
  if (/주차\s*정산기.*(할인|등록|정산)/.test(rewriteCommon(original))) {
    const floor = normalizeFloors(original).match(/(?:CGV\s*)?([B\dF~.-]+층?|\d+층)\s*(?:로비\s*)?주차\s*정산기/);
    return {
      label: '주차 인증',
      value: floor ? `${floor[1]} 주차 정산기에서 할인 등록·정산` : '주차 정산기에서 할인 등록·정산',
    };
  }

  // 합산/재입차/카드결제는 의미를 바꾸지 않는 고정 문장으로 재작성한다.
  const maxCombined = original.match(/(?:타\s*매장|타매장|다른\s*매장).*?(?:포함|합산).*?최대\s*(\d+)\s*시간/);
  if (maxCombined) return { label: '다른 매장 합산', value: `다른 매장 이용분과 합산해 최대 ${maxCombined[1]}시간 할인` };

  if (/1일\s*1회/.test(original) && /재입차/.test(original)) {
    return { label: '주의사항', value: '주차 할인은 하루 1회 · 재입차 시 요금 부과' };
  }
  if (/재입차/.test(original) && /할인\s*불가|요금\s*발생|정상\s*요금/.test(original)) {
    return { label: '주의사항', value: '출차 후 재입차 시 할인 미적용' };
  }
  if (/카드\s*결제만\s*가능/.test(original)) {
    return { label: '주의사항', value: '주차요금 결제는 카드만 가능' };
  }
  if (/주차장.*협소|주차\s*공간.*협소/.test(original)) {
    return { label: '주의사항', value: /대중교통/.test(original) ? '주차 공간 협소 · 대중교통 이용 권장' : '주차 공간이 협소함' };
  }

  const rewritten = rewriteCommon(original)
    .replace(/테크노마트와\s*프라임상가\s*사이/g, '테크노마트·프라임상가 사이')
    .replace(/몰오브케이\s*주차장/g, '몰오브케이 주차장')
    .replace(/영화\s*관람\s*고객\s*한\s*함/g, '영화 관람 고객 대상')
    .replace(/영화\s*미관람\s*시/g, '영화 미관람 시')
    .replace(/별도\s*정산/g, '별도 결제')
    .replace(/초과\s*요금은\s*주차장\s*무인\s*정산기\s*정산\s*필요/g, '초과요금은 무인 정산기에서 결제')
    .replace(/할인\s*적용\s*후\s*재입차\s*시\s*주차\s*요금\s*발생/g, '할인 후 재입차 시 주차요금 부과')
    .trim();

  const label = inferLabel(original, rewritten);
  if (!label || !rewritten) return null;

  // 공식 문장이 사실상 그대로 남는 경우에는 화면에 싣지 않는다.
  if (clean(rewritten) === clean(original)) return null;
  return { label, value: rewritten };
}

export function parkingGroups(branch: Branch): ParkingGroup[] {
  const p = branch.parking;
  const sources = [p.raw, p.guide, p.howTo, p.fee].filter(Boolean) as string[];
  if (sources.length === 0) return [];

  const rawLines = sources
    .join(NEWLINE)
    .split(NEWLINE)
    .map(stripDecorations)
    .filter((line) => line.length > 1);

  // 괄호로 이어진 문장은 한 사실로 합친다.
  const lines: string[] = [];
  for (const line of rawLines) {
    const prev = lines[lines.length - 1];
    const open = prev ? (prev.match(/[(（]/g) ?? []).length - (prev.match(/[)）]/g) ?? []).length : 0;
    if (prev && (open > 0 || /[,·]$/.test(prev))) lines[lines.length - 1] = `${prev} ${line}`;
    else lines.push(line);
  }

  const buckets = new Map<string, string[]>();
  const push = (label: string, value: string) => {
    const normalized = value.replace(/\s/g, '');
    const list = buckets.get(label) ?? [];
    if (!list.some((v) => v.replace(/\s/g, '') === normalized)) list.push(value);
    buckets.set(label, list);
  };

  for (const line of lines) {
    const fact = standardizeFact(line);
    if (fact) push(fact.label, fact.value);
  }

  // 원문에서 핵심 요약을 확실히 추출했는데 개별 줄 변환이 못 잡은 경우 보완한다.
  const summary = parkingSummary(branch);
  if (summary?.free) push('무료 주차', `영화 관람 시 ${summary.free} 무료`);
  if (summary?.flat) push('무료 주차', `영화 관람 할인 · ${summary.flat}`);
  if (summary?.overage) push('초과 요금', summary.overage);
  if (summary?.verify) push('주차 인증', `${summary.verify} 이용`);

  return GROUP_ORDER.filter((label) => buckets.get(label)?.length).map((label) => ({
    label,
    items: buckets.get(label)!,
  }));
}
