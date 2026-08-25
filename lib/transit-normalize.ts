import type { Branch } from './types';

/**
 * 브랜드 원본 교통 문구를 화면 파서가 읽기 좋은 형태로만 정리한다.
 * 정보 자체를 새로 만들지 않고, 저장 과정에서 붙어버린 구분자/엔티티/노선-정류장
 * 경계만 복원한다. 원본 JSON은 변경하지 않는다.
 */

function decodeEntities(value: string): string {
  let out = value;
  for (let i = 0; i < 3; i++) {
    out = out
      .replace(/&amp;/gi, '&')
      .replace(/&nbsp;?/gi, ' ')
      .replace(/&#160;?/gi, ' ')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'");
  }
  return out.replace(/\u00a0/g, ' ');
}

const ROUTE = String.raw`(?:[A-Za-z]{1,4}\d[A-Za-z0-9-]*|[가-힣]{1,3}\d[A-Za-z0-9-]*|\d[A-Za-z0-9-]*)`;
const ROUTE_WITH_NOTE = String.raw`${ROUTE}(?:\([^()\n,]{1,18}\))?`;
const ROUTE_PREFIX = new RegExp(`^((?:${ROUTE}\\s*,\\s*)*${ROUTE})([가-힣].+)$`);
const ROUTE_SEQUENCE = new RegExp(`(${ROUTE_WITH_NOTE}(?:\\s*,\\s*${ROUTE_WITH_NOTE}){4,})`);
const ROUTE_GROUP_WORDS = ['급행', '간선', '지선', '광역', '마을', '좌석', '일반', '공항', '순환', '심야', '직행', '도시형', '노선'];
const ROUTE_GROUP_ALT = ROUTE_GROUP_WORDS.join('|');

const ROUTE_BAD_SUFFIX = /(분|초|미터|층|아파트|사거리|입구|정류장|출구|방향|거리|이내|이상|하차|도보|개|호기|회|대|명|석|원|m)$/i;

function cleanEdge(text: string): string {
  return text
    .replace(/^\s*[.,:：/·)]+\s*/, '')
    .replace(/\s*[.,:：/·(]+\s*$/, '')
    .replace(/^\s*-\s*/, '')
    .replace(/\s*-\s*$/, '')
    .trim();
}

function parseRouteToken(token: string): { route: string; note?: string } | null {
  const trimmed = token.trim().replace(/번$/, '');
  const m = trimmed.match(/^([^()]+?)(?:\(([^()]*)\))?$/);
  if (!m) return null;
  const route = m[1].trim().replace(/번$/, '');
  if (!/\d/.test(route) || route.length > 10 || ROUTE_BAD_SUFFIX.test(route)) return null;
  return { route, note: m[2]?.trim() || undefined };
}

function separateRoutePrefix(line: string): string {
  const m = line.match(ROUTE_PREFIX);
  if (!m) return line;
  const routes = m[1].trim();
  const note = m[2].trim();
  const looksConfident =
    routes.includes(',') ||
    /^[A-Za-z]/.test(routes) ||
    /^[가-힣]{1,3}\d/.test(routes) ||
    (/^\d{2,}/.test(routes) && /(역|정류장|하차|방면|백화점|아파트|터미널|사거리|입구)/.test(note));
  return looksConfident ? `[${note}] ${routes}` : line;
}

function normalizeBracketGroups(text: string): string {
  let out = text
    .replace(/\[\[\s*([^\[\]]+?)\s*\]\]/g, '[$1]')
    .replace(/\[\s*([^\[\]]+?)\s*\]/g, '[$1]')
    .replace(new RegExp(`(?:버스\\s*)?이용\\s*시\\s*(?=\\[(?:${ROUTE_GROUP_ALT})\\])`, 'g'), '');

  out = out.replace(new RegExp(`\\s+(?=\\[(?:${ROUTE_GROUP_ALT})\\]\\s*)`, 'g'), '\n');
  return out;
}

function normalizeMissingRouteCommas(line: string): string {
  if ((line.match(/,/g) ?? []).length < 4) return line;
  let out = line;
  const pair = /([A-Za-z가-힣]*\d[A-Za-z0-9-]*)\s+([A-Za-z가-힣]*\d[A-Za-z0-9-]*)(?=\s*(?:,|$))/g;
  for (let i = 0; i < 3; i++) out = out.replace(pair, '$1, $2');
  return out.replace(/\s*,\s*/g, ', ');
}

function splitRouteSequence(input: string): string[] {
  const line = normalizeMissingRouteCommas(input);
  const match = line.match(ROUTE_SEQUENCE);
  if (!match || match.index == null) return [line];

  const rawRoutes = match[1];
  const parsed = rawRoutes
    .split(',')
    .map(parseRouteToken)
    .filter((v): v is { route: string; note?: string } => Boolean(v));
  if (parsed.length < 5) return [line];

  const before = cleanEdge(line.slice(0, match.index));
  const after = cleanEdge(line.slice(match.index + rawRoutes.length));
  const routes = parsed.map((p) => p.route);
  const nightRoutes = parsed.filter((p) => p.note === '심야').map((p) => p.route);
  const annotated = parsed.filter((p) => p.note && p.note !== '심야');
  const out: string[] = [];

  const bracket = before.match(/^\[([^\]]+)\]$/);
  const brokenBracket = !bracket ? before.match(/^([^\[\]]{1,60})\]$/) : null;
  if (bracket) out.push(`[${bracket[1].trim()}] ${routes.join(', ')}`);
  else if (brokenBracket) out.push(`[${brokenBracket[1].trim()}] ${routes.join(', ')}`);
  else if (before && before.length <= 70 && !/[→>]/.test(before)) out.push(`[${before}] ${routes.join(', ')}`);
  else {
    if (before) out.push(before);
    out.push(routes.join(', '));
  }

  if (nightRoutes.length > 0) out.push(`[심야 노선] ${nightRoutes.join(', ')}`);
  for (const item of annotated) out.push(`[${item.route}] ${item.note}`);
  if (after) out.push(after);
  return out;
}

function splitGluedSubway(text: string): string {
  return text.replace(/([가-힣)'])\s*(?=(?:\d{1,2})\s*호선\b)/g, '$1\n');
}

function splitLongSteps(line: string): string[] {
  if (line.length <= 115 || !/[→>]/.test(line)) return [line];
  const steps = line.split(/\s*(?:→|-?>)\s*/).map((s) => s.trim()).filter(Boolean);
  if (steps.length < 3) return [line];
  const groups: string[] = [];
  let current = '';
  for (const step of steps) {
    const next = current ? `${current} → ${step}` : step;
    if (current && next.length > 95) {
      groups.push(current);
      current = step;
    } else current = next;
  }
  if (current) groups.push(current);
  return groups.length > 1 ? groups : [line];
}

/** `- 방향` 다음 줄부터 이어지는 긴 노선 번호 묶음을 하나의 라벨 항목으로 복원한다. */
function joinWrappedRouteBlocks(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i].trim();
    const labelMatch = current.match(/^[-•·]\s*(.+(?:방향|하차))\s*$/);
    if (!labelMatch || i + 1 >= lines.length) {
      out.push(current);
      continue;
    }

    const chunks: string[] = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const next = lines[j].trim();
      if (/^[-•·]\s*[가-힣].*(?:방향|하차)\s*$/.test(next) || /^#\s+/.test(next)) break;
      const cleaned = next.replace(/^:\s*/, '').trim();
      if (!cleaned) continue;
      // 노선 묶음으로 보이는 줄만 합친다. 안내문까지 삼키지 않는다.
      if (!/\d/.test(cleaned) || ((cleaned.match(/,/g) ?? []).length < 1 && !/^\w*\d/.test(cleaned))) break;
      chunks.push(cleaned);
    }
    if (chunks.length > 0) {
      out.push(`[${labelMatch[1].trim()}] ${normalizeMissingRouteCommas(chunks.join(' '))}`);
      i = j - 1;
    } else out.push(current);
  }
  return out;
}

/** 괄호 안에 `A역 : 노선 / B역 : 노선`이 같이 들어간 형식을 두 항목으로 나눈다. */
function splitPairedRouteGroups(line: string): string[] {
  const m = line.match(/^([\s\S]*?)\(([^:()]{1,40})\s*:\s*([^/()]+)\/\s*([^:()]{1,40})\s*:\s*([^()]+)\)\s*$/);
  if (!m) return [line];
  const prefix = cleanEdge(m[1]);
  const result: string[] = [];
  if (prefix) result.push(prefix);
  result.push(`[${m[2].trim()}] ${m[3].trim()}`);
  result.push(`[${m[4].trim()}] ${m[5].trim()}`);
  return result;
}

/** raw의 다양한 제목 표기를 # 지하철 / # 버스 형식으로 통일한다. */
function normalizeRawMarkers(input: string[]): string[] {
  const expanded: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const trimmed = input[i].trim();

    // `■` 한 줄 뒤에 `버스 이용시`가 오는 수집 형태.
    if (/^[#■]$/.test(trimmed) && i + 1 < input.length) {
      const next = input[i + 1].trim().match(/^(지하철|버스)\s*(?:이용\s*시|안내)?\s*$/);
      if (next) {
        expanded.push(`# ${next[1]}`);
        i++;
        continue;
      }
    }

    const bracketMode = trimmed.match(/^\[(지하철|버스)\s*(?:이용\s*시|안내)?\]$/);
    if (bracketMode) {
      expanded.push(`# ${bracketMode[1]}`);
      continue;
    }

    const numbered = trimmed.match(/^\d+[.)]\s*(지하철|버스)\s*:?[ ]*(.*)$/);
    if (numbered) {
      expanded.push(`# ${numbered[1]}`);
      if (numbered[2]) expanded.push(numbered[2]);
      continue;
    }

    if (/^(지하철|버스)\s*(?:이용\s*시|안내)?$/.test(trimmed)) {
      expanded.push(`# ${trimmed.startsWith('지하철') ? '지하철' : '버스'}`);
      continue;
    }

    const anyHeader = trimmed.match(/^[#■]\s*([^#■]+?)\s*$/);
    if (anyHeader && anyHeader[1].length <= 30) {
      const title = anyHeader[1].replace(/\s*(?:이용\s*시|안내)\s*$/, '').trim();
      expanded.push(`# ${title || anyHeader[1].trim()}`);
      continue;
    }
    expanded.push(trimmed.replace(/\s*[#■]\s*$/, '').trim());
  }

  const markerCount = expanded.filter((line) => /^#\s+/.test(line)).length;
  if (markerCount <= 1) return expanded.filter((line) => !/^#\s*(?:지하철|버스|교통)$/.test(line));
  return expanded;
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (/^#\s+/.test(line)) {
      result.push(line);
      continue;
    }
    if (seen.has(line)) continue;
    seen.add(line);
    result.push(line);
  }
  return result;
}

export function normalizeTransitText(value: string | null | undefined, kind: 'raw' | 'field' = 'field'): string | null {
  if (!value) return value ?? null;

  const normalized = normalizeBracketGroups(splitGluedSubway(decodeEntities(value)))
    .replace(/_+/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    // 같은 줄에 `도보 : ... 버스 : ...`가 붙어 있으면 방법별로 분리한다.
    .replace(/\s+(?=(?:도보|버스)\s*:)/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();

  let lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  if (kind === 'raw') lines = normalizeRawMarkers(lines);
  lines = joinWrappedRouteBlocks(lines).flatMap(splitPairedRouteGroups);

  // 뒤쪽에 두 번째 노선군이 있는 줄도 다시 처리하도록 두 번 통과시킨다.
  lines = lines
    .flatMap((line) => (/^#\s+/.test(line) ? [line] : splitRouteSequence(line)))
    .flatMap((line) => (/^#\s+/.test(line) ? [line] : splitRouteSequence(line)))
    .flatMap(splitLongSteps)
    .map(separateRoutePrefix)
    .map((line) => line.replace(/^[·•]\s*/, '').trim())
    .filter(Boolean);

  return dedupeLines(lines).join('\n');
}

function rawLooksBusOnly(raw: string): boolean {
  const decoded = decodeEntities(raw);
  if (/지하철|\d+\s*호선/.test(decoded)) return false;
  // Drive In 영도처럼 버스 구획 뒤에 예매/관람 규칙 `■ 안내`가 이어지는 원문은 제외.
  if (/[#■]\s*(?:안내|자가용|주차|입차)/.test(decoded)) return false;
  const routeHeavy = /(?:[A-Za-z가-힣]*\d[\w-]*\s*,\s*){4,}/.test(decoded);
  return /버스|BRT/.test(decoded) || (routeHeavy && /하차|정류장/.test(decoded));
}

function stripBusOnlyHeading(text: string): string {
  return text
    .replace(/^\s*[#■]?\s*버스\s*(?:이용\s*시|안내)?\s*\n?/i, '')
    .replace(/^\s*\[버스\s*(?:이용\s*시|안내)?\]\s*\n?/i, '')
    .trim();
}

export function normalizeBranchTransit(branch: Branch): Branch {
  const originalRaw = branch.transit.raw;

  // raw 한 덩어리가 사실상 버스 정보뿐인 지점은 bus 필드로 승격한다.
  // 그러면 페이지의 복잡한 raw 폴백을 거치지 않고 동일한 버스 카드 파서를 탄다.
  if (originalRaw && !branch.transit.bus && !branch.transit.subway && rawLooksBusOnly(originalRaw)) {
    return {
      ...branch,
      transit: {
        raw: null,
        subway: null,
        bus: normalizeTransitText(stripBusOnlyHeading(originalRaw), 'field'),
      },
    };
  }

  return {
    ...branch,
    transit: {
      ...branch.transit,
      raw: normalizeTransitText(originalRaw, 'raw'),
      subway: normalizeTransitText(branch.transit.subway),
      bus: normalizeTransitText(branch.transit.bus),
    },
  };
}
