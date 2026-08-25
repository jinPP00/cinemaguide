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

const ROUTE_BAD_SUFFIX = /(분|초|미터|층|아파트|사거리|입구|정류장|출구|방향|거리|이내|이상|하차|도보|개|호기|회|대|명|석|원|m)$/i;

function cleanEdge(text: string): string {
  return text
    .replace(/^\s*[,:：/·)]+\s*/, '')
    .replace(/\s*[,:：/·(]+\s*$/, '')
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

/**
 * "1132,1167노원역 9번출구 하차" → "[노원역 9번출구 하차] 1132,1167"
 * "노원05롯데백화점 앞 하차" → "[롯데백화점 앞 하차] 노원05"
 */
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
  if (!looksConfident) return line;

  return `[${note}] ${routes}`;
}

/**
 * 한 줄 안에 "정류장 설명 + 버스번호 수십 개 + 도보 경로"가 붙은 원문을
 * 기존 TransitItems가 읽을 수 있는 여러 줄로 분해한다. 최소 5개 노선이 연속된
 * 경우에만 작동하므로 출구 번호·거리 같은 일반 숫자는 건드리지 않는다.
 */
function splitRouteSequence(line: string): string[] {
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

  // 짧은 정류장/방면 문구는 노선 칩의 라벨로 붙인다. 긴 이동 경로는 별도 줄로 둔다.
  if (before && before.length <= 70 && !/[→>]/.test(before)) {
    out.push(`[${before}] ${routes.join(', ')}`);
  } else {
    if (before) out.push(before);
    out.push(routes.join(', '));
  }

  if (nightRoutes.length > 0) out.push(`[심야 노선] ${nightRoutes.join(', ')}`);
  for (const item of annotated) out.push(`[${item.route}] ${item.note}`);
  if (after) out.push(after);

  return out;
}

function splitGluedSubway(text: string): string {
  // "...이용7호선 노원역..."처럼 두 지하철 안내가 줄바꿈 없이 붙은 경우.
  return text.replace(/([가-힣)'])\s*(?=(?:\d{1,2})\s*호선\b)/g, '$1\n');
}

/** 긴 길찾기는 내용을 버리지 않고 90~100자 안쪽의 여러 줄로만 나눈다. */
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
    } else {
      current = next;
    }
  }
  if (current) groups.push(current);
  return groups.length > 1 ? groups : [line];
}

function normalizeRawMarkers(lines: string[]): string[] {
  const standardized = lines.map((line) => {
    const trimmed = line.trim();
    const header = trimmed.match(/^[#■]\s*(지하철|버스)(?:\s*(?:이용\s*시|안내))?\s*$/);
    if (header) return `# ${header[1]}`;
    return trimmed.replace(/\s*[#■]\s*$/, '').trim();
  });

  const transportHeaders = standardized.filter((line) => /^#\s*(?:지하철|버스)$/.test(line));
  const hasSubway = transportHeaders.some((line) => line.includes('지하철'));
  const hasBus = transportHeaders.some((line) => line.includes('버스'));

  // 한 종류의 헤더만 있는 원문은 섹션 분리용 마커가 아니라 군더더기다.
  if (!(hasSubway && hasBus)) {
    return standardized.filter((line) => !/^#\s*(?:지하철|버스)$/.test(line));
  }
  return standardized;
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    // 섹션 마커는 같은 단어라도 위치가 의미이므로 중복 제거하지 않는다.
    if (/^#\s*(?:지하철|버스)$/.test(line)) {
      result.push(line);
      continue;
    }
    if (seen.has(line)) continue;
    seen.add(line);
    result.push(line);
  }
  return result;
}

export function normalizeTransitText(
  value: string | null | undefined,
  kind: 'raw' | 'field' = 'field',
): string | null {
  if (!value) return value ?? null;

  const normalized = splitGluedSubway(decodeEntities(value))
    .replace(/_+/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();

  let lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (kind === 'raw') lines = normalizeRawMarkers(lines);

  lines = lines
    .flatMap((line) => (/^#\s*(?:지하철|버스)$/.test(line) ? [line] : splitRouteSequence(line)))
    .flatMap(splitLongSteps)
    .map(separateRoutePrefix)
    .map((line) => line.replace(/^[·•]\s*/, '').trim())
    .filter(Boolean);

  return dedupeLines(lines).join('\n');
}

export function normalizeBranchTransit(branch: Branch): Branch {
  return {
    ...branch,
    transit: {
      ...branch.transit,
      raw: normalizeTransitText(branch.transit.raw, 'raw'),
      subway: normalizeTransitText(branch.transit.subway),
      bus: normalizeTransitText(branch.transit.bus),
    },
  };
}
