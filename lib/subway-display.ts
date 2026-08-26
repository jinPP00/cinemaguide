import type { Branch } from './types';

/**
 * 지하철 안내는 공식 원문의 사실만 사용하되 화면에서는 짧은 길찾기 문법으로 다시 쓴다.
 * 역명·노선·출구·거리·건물명·층수·방향은 바꾸지 않고, 원문 특유의 조사·존댓말·
 * 반복 동사·괄호형 동선을 정리한다. 원본 JSON은 수정하지 않는다.
 */
function rewriteSubwayLine(input: string): string {
  const label = input.match(/^(\[[^\]]+\]\s*)/);
  const prefix = label?.[1] ?? '';
  let line = label ? input.slice(label[0].length).trim() : input.trim();

  line = line
    // 표기 통일
    .replace(/엘레베이터|엘리베이타/g, '엘리베이터')
    .replace(/(\d+)\s*번\s*출구/g, '$1번 출구')
    .replace(/(\d+(?:\.\d+)?)\s*(?:미터|[mM])(?=\s|$|[),·→>])/g, '$1m')
    .replace(/도보\s*직진|도보직진|도보로\s*직진/g, '직진')
    .replace(/우측\s*방향/g, '우측')
    .replace(/좌측\s*방향/g, '좌측')
    .replace(/오른쪽\s*방향/g, '우측')
    .replace(/왼쪽\s*방향/g, '좌측')

    // 괄호 안에 들어간 이동 단계는 본문 단계로 꺼낸다.
    .replace(/\(\s*U\s*턴\s*\)/gi, ' → U턴 후 ')
    .replace(/방향\s*\(\s*(\d+(?:\.\d+)?)m\s*직진\s*\)/g, '방향 $1m')
    .replace(/\(\s*(\d+(?:\.\d+)?)m\s*직진\s*\)/g, '$1m')
    .replace(/^([^()]*)\(([^()]*(?:직진|도보|방향|진입|엘리베이터|E\/V)[^()]*)\)(.*)$/i, '$1 → $2 $3')

    // 실제 길찾기 단계만 남긴다.
    .replace(/(\d+번 출구)에서\s*(?:나와|나온\s*후|하차(?:하여|한\s*후)?|이동(?:하여|한\s*후)?)?\s*/g, '$1 → ')
    .replace(/([가-힣A-Za-z0-9·()]+역)\s+하차\s+(\d+번 출구)/g, '$1 → $2')
    .replace(/하차\s*(?:후|하여|한\s*후)\s*,?\s*/g, '하차 → ')
    .replace(/횡단보도(?:를)?\s*(?:이용|건넌|건너간)\s*(?:후)?/g, '횡단보도 건너')
    .replace(/문\s*통과\s*후/g, '문 통과 →')
    .replace(/통과\s*후/g, '통과 →')
    .replace(/진입\s*후/g, '진입 →')
    .replace(/이동\s*후/g, '이동 →')
    .replace(/이용\s*후/g, '이용 →')
    .replace(/탑승\s*후/g, '탑승 →')
    .replace(/나온\s*후|나오신\s*후|나와서/g, '나와 →')
    .replace(/밖으로\s*이동/g, '밖으로 나와')

    // 건물·엘리베이터 이동 표현을 짧게 만든다.
    .replace(/([^→,]+?)\s+출입문\s+진입/g, '$1 출입문으로 진입')
    .replace(/([^→,]+?)\s+건물\s+진입/g, '$1 건물로 진입')
    .replace(/((?:\d+(?:\s*[-~]\s*\d+)?호기)\s+)?엘리베이터\s*(?:를\s*)?(?:탑승|이용)(?:하여|해)?\s*(\d+층)(?:으로)?\s*(?:이동)?/g, '$1엘리베이터로 $2')
    .replace(/((?:\d+(?:\s*[-~]\s*\d+)?호기)\s+)?E\/V\s*(?:를\s*)?(?:탑승|이용)(?:하여|해)?\s*(\d+층)(?:으로)?\s*(?:이동)?/gi, '$1E/V로 $2')
    .replace(/엘리베이터\s*(?:탑승|이용)\s*→\s*(\d+층)(?:\s*이동)?/g, '엘리베이터로 $1')
    .replace(/E\/V\s*(?:탑승|이용)\s*→\s*(\d+층)(?:\s*이동)?/gi, 'E/V로 $1')
    .replace(/(\d+층)\s*이동/g, '$1')

    // 거리·소요시간과 방향 표현을 간결하게 만든다.
    .replace(/직진\s*(\d+(?:\.\d+)?)m/g, '$1m 직진')
    .replace(/(?:도보로|도보)\s*(약\s*)?(\d+)\s*분\s*소요/g, '도보 $1$2분')
    .replace(/방면으로\s*이동/g, '방면')
    .replace(/방향으로\s*이동/g, '방향')
    .replace(/방향\s*이동/g, '방향')
    .replace(/이용(?:하여|해)\s+/g, '이용 → ')

    // 안내문 어미는 삭제하고 경로 정보만 남긴다.
    .replace(/\s*(?:오시면|가시면|이동하시면|진입하시면)\s*됩니다[.!]?$/g, '')
    .replace(/\s*(?:해\s*주세요|해주세요|해주시기\s*바랍니다|바랍니다)[.!]?$/g, '')

    // 모든 동선 구분자는 같은 화살표로 표시한다.
    .replace(/\s*(?:-?>|→)\s*/g, ' → ')
    .replace(/\s*→\s*→\s*/g, ' → ')
    .replace(/→\s*,/g, '→ ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^→\s*|\s*→$/g, '')
    .trim();

  return `${prefix}${line}`.trim();
}

/** raw 한 덩어리에 지하철·버스가 같이 저장된 지점은 지하철 구획만 바꾼다. */
function rewriteRawSubway(raw: string | null): string | null {
  if (!raw) return raw;
  const lines = raw.split('\n');
  let inSubway = false;

  return lines
    .map((original) => {
      const trimmed = original.trim();
      const plain = trimmed.replace(/^[-·•●○★■ㆍ]\s*/, '').trim();

      const inline = plain.match(/^(?:\d+[.)]\s*)?지하철\s*(?:이용\s*시|안내)?\s*[:：]\s*(.+)$/);
      if (inline) return original.replace(inline[1], rewriteSubwayLine(inline[1]));

      if (/^(?:[#■]\s*|\[)?[^\n\]]*지하철(?:\s*이용\s*시|\s*안내)?\]?\s*$/.test(plain)) {
        inSubway = true;
        return original;
      }
      if (/^(?:[#■]\s*|\[)?[^\n\]]*버스(?:\s*이용\s*시|\s*안내)?\]?\s*$/.test(plain)) {
        inSubway = false;
        return original;
      }

      // 마커가 없는 raw도 `4호선 ○○역 ... 출구/도보`처럼 지하철임이 분명한 줄만 처리한다.
      const clearlySubway = /\d{1,2}\s*호선/.test(plain) && /(?:역|출구)/.test(plain);
      return inSubway || clearlySubway ? rewriteSubwayLine(original) : original;
    })
    .join('\n');
}

export function rewriteBranchSubwayDisplay(branch: Branch): Branch {
  return {
    ...branch,
    transit: {
      ...branch.transit,
      raw: rewriteRawSubway(branch.transit.raw),
      subway: branch.transit.subway
        ? branch.transit.subway.split('\n').map(rewriteSubwayLine).join('\n')
        : branch.transit.subway,
    },
  };
}
