import type { Branch } from './types';

/**
 * 지하철 문구 공통 변환 뒤에도 남을 수 있는 소수의 원문형 표현만 최종 정리한다.
 * 새로운 정보를 만들지 않고 이미 있는 역·정류장·노선·방향·거리만 재배열한다.
 */
function finalLine(input: string): string {
  let line = input.trim();

  // 지하철 → 버스 환승 안내가 한 문장으로 붙은 형태.
  line = line.replace(
    /(?:지하철\s*)?([가-힣A-Za-z0-9·()]+선\s+)?([가-힣A-Za-z0-9·()]+역)\s*하차\s*후\s*버스\s*이용\s*,?\s*([가-힣A-Za-z0-9·\s]+정류장)\s*하차\s*\(([^)]+)\)/g,
    (_m, route: string | undefined, station: string, stop: string, buses: string) =>
      `${route ?? ''}${station} → 버스 환승 → ${stop.trim()}에서 내려 · ${buses.trim()}`,
  );

  return line
    .replace(/우측\s*방향/g, '오른쪽')
    .replace(/좌측\s*방향/g, '왼쪽')
    .replace(/도보\s*직진|도보직진/g, '직진')
    .replace(/엘레베이터/g, '엘리베이터')
    .replace(/(\d+)\s*번\s*출구/g, '$1번 출구')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function rewriteRawSubwayFinal(raw: string | null): string | null {
  if (!raw) return raw;
  const lines = raw.split('\n');
  let inSubway = false;

  return lines
    .map((line) => {
      const plain = line.trim().replace(/^[-·•●○★■ㆍ]\s*/, '').trim();

      if (/^(?:[#■]\s*|\[|<)?[^\n\]>*]*지하철(?:\s*이용\s*시|\s*안내)?[\]>]?\s*$/.test(plain)) {
        inSubway = true;
        return line;
      }
      if (/^(?:[#■]\s*|\[|<)?[^\n\]>*]*버스(?:\s*이용\s*시|\s*안내)?[\]>]?\s*$/.test(plain)) {
        inSubway = false;
        return line;
      }

      const inline = plain.match(/^(?:\d+[.)]\s*)?지하철\s*(?:이용\s*시|안내)?\s*[:：]\s*(.+)$/);
      if (inline) return line.replace(inline[1], finalLine(inline[1]));

      const clearlySubway =
        (/\d{1,2}\s*호선/.test(plain) && /(?:역|출구)/.test(plain)) ||
        (/(?:경의중앙선|수인.?분당선|신분당선|공항철도|경춘선|에버라인선)/.test(plain) && /(?:역|출구|버스)/.test(plain));

      return inSubway || clearlySubway ? finalLine(line) : line;
    })
    .join('\n');
}

export function finalizeBranchSubwayDisplay(branch: Branch): Branch {
  // 수원남문은 공식 원본의 두 지하철 안내가 모두 `역 하차 후 버스 이용` 형식이고,
  // 첫 줄에는 정류장이 두 곳 이어져 있어 일반 정규식으로 자르면 의미가 흐려진다.
  // 원본에 적힌 역·정류장·노선만 사용해 환승 순서로 재배열한다.
  if (branch.pageSlug === '경기수원남문-메가박스') {
    return {
      ...branch,
      transit: {
        ...branch.transit,
        raw: rewriteRawSubwayFinal(branch.transit.raw),
        subway: [
          '1호선 수원역 → 버스 환승 → 팔달문 정류장에서 내려 · 13번 → 녹산문고 앞·경기도박치유센터 정류장에서 내려 · 730번, 10번, 11-1번, 720-2번',
          '수인분당선 매교역 → 버스 환승 → 팔달문 정류장에서 내려 · 20번, 25번, 64번, 112번, 20-1번',
        ].join('\n'),
      },
    };
  }

  return {
    ...branch,
    transit: {
      ...branch.transit,
      raw: rewriteRawSubwayFinal(branch.transit.raw),
      subway: branch.transit.subway
        ? branch.transit.subway.split('\n').map(finalLine).join('\n')
        : branch.transit.subway,
    },
  };
}
