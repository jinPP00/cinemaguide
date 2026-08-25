import type { Branch } from './types';

/**
 * 브랜드 원본 교통 문구를 화면 파서가 읽기 좋은 형태로만 정리한다.
 * 정보 자체를 새로 만들지 않고, 저장 과정에서 붙어버린 구분자/엔티티/노선-정류장
 * 경계만 복원한다. 원본 JSON은 변경하지 않는다.
 */

function decodeEntities(value: string): string {
  let out = value;
  // 일부 롯데 데이터에 "&nbsp"가 세미콜론 없이 들어 있고, React가 이를 다시
  // escape하면 화면에 &nbsp; 글자 자체가 보인다.
  for (let i = 0; i < 2; i++) {
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
const ROUTE_PREFIX = new RegExp(`^((?:${ROUTE}\\s*,\\s*)*${ROUTE})([가-힣].+)$`);

/**
 * "1132,1167노원역 9번출구 하차" → "[노원역 9번출구 하차] 1132,1167"
 * "노원05롯데백화점 앞 하차" → "[롯데백화점 앞 하차] 노원05"
 *
 * 이렇게 바꾸면 기존 TransitItems 파서가 뒤의 노선번호를 칩으로 그릴 수 있다.
 */
function separateRoutePrefix(line: string): string {
  const m = line.match(ROUTE_PREFIX);
  if (!m) return line;
  const routes = m[1].trim();
  const note = m[2].trim();

  // "2번출구" 같은 일반 숫자+한글을 버스노선으로 오인하지 않는다.
  const looksConfident =
    routes.includes(',') ||
    /^[A-Za-z]/.test(routes) ||
    /^[가-힣]{1,3}\d/.test(routes) ||
    (/^\d{2,}/.test(routes) && /(역|정류장|하차|방면|백화점|아파트|터미널|사거리|입구)/.test(note));
  if (!looksConfident) return line;

  return `[${note}] ${routes}`;
}

function splitGluedSubway(text: string): string {
  // "...이용7호선 노원역..."처럼 두 지하철 안내가 줄바꿈 없이 붙은 경우.
  return text.replace(/([가-힣)'])\s*(?=(?:\d{1,2})\s*호선\b)/g, '$1\n');
}

export function normalizeTransitText(value: string | null | undefined): string | null {
  if (!value) return value ?? null;

  const normalized = splitGluedSubway(decodeEntities(value))
    // 롯데 원본에서 '_'는 정류장/노선 묶음 사이 구분자로 쓰인다.
    .replace(/_+/g, '\n')
    // HTML 줄바꿈이 문자열로 남은 경우.
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(separateRoutePrefix);

  return lines.join('\n');
}

export function normalizeBranchTransit(branch: Branch): Branch {
  return {
    ...branch,
    transit: {
      ...branch.transit,
      raw: normalizeTransitText(branch.transit.raw),
      subway: normalizeTransitText(branch.transit.subway),
      bus: normalizeTransitText(branch.transit.bus),
    },
  };
}
