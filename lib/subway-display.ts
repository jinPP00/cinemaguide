import type { Branch } from './types';

function compactForCompare(value: string): string {
  return value.replace(/[>→()[\]{}:：,./·'"\s_-]+/g, '').toLowerCase();
}

/**
 * 지하철 안내는 공식 원문의 사실만 사용하되 화면에서는 짧은 길찾기 문법으로 다시 쓴다.
 * 역명·노선·출구·거리·건물명·층수·방향은 바꾸지 않고, 원문 특유의 조사·존댓말·
 * 반복 동사·괄호형 동선을 정리한다. 원본 JSON은 수정하지 않는다.
 */
function rewriteSubwayLine(input: string): string {
  const label = input.match(/^(\[[^\]]+\]\s*)/);
  let prefix = label?.[1] ?? '';
  let line = label ? input.slice(label[0].length).trim() : input.trim();
  const originalLine = line;

  prefix = prefix
    .replace(/영업\s*시간\s*외/g, '영업 종료 후')
    .replace(/영업시간\s*외/g, '영업 종료 후')
    .replace(/영업\s*시간\s*내/g, '영업 중')
    .replace(/영업시간\s*내/g, '영업 중')
    .replace(/이용\s*방법/g, '이용');

  line = line
    .replace(/[‘’“”＂"]/g, '')
    .replace(/\s*\|\s*/g, ' · ')
    .replace(/\s+및\s+/g, ' · ')
    .replace(/^지하철\s*/g, '')
    .replace(/(^|[\s:：])지하철\s+(?=\d|[가-힣]+선)/g, '$1')
    .replace(/엘레베이터|엘리베이타/g, '엘리베이터')
    .replace(/(\d+)\s*번\s*출구/g, '$1번 출구')
    .replace(/(\d+(?:\.\d+)?)\s*(?:미터|[mM])(?=\s|$|[),·→>])/g, '$1m')
    .replace(/도보\s*직진|도보직진|도보로\s*직진/g, '직진')
    .replace(/우측\s*방향/g, '오른쪽')
    .replace(/좌측\s*방향/g, '왼쪽')
    .replace(/\b우측\b/g, '오른쪽')
    .replace(/\b좌측\b/g, '왼쪽')
    .replace(/오른쪽\s*방향/g, '오른쪽')
    .replace(/왼쪽\s*방향/g, '왼쪽')
    .replace(/북서\s*방향/g, '북서쪽')

    .replace(/영업\s*시간\s*외/g, '영업 종료 후')
    .replace(/영업시간\s*외/g, '영업 종료 후')
    .replace(/영업\s*시간\s*내/g, '영업 중')
    .replace(/영업시간\s*내/g, '영업 중')
    .replace(/입점\s*건물\s*영업시간\s*전\s*\/\s*후/g, '건물 영업 전·후')
    .replace(/(\d+시(?:\s*\d+분)?)\s*이전/g, '$1 전')
    .replace(/(\d+시(?:\s*\d+분)?)\s*이후/g, '$1 후')
    .replace(/통행\s*제한될\s*수\s*있으니/g, '통행 제한 가능 ·')
    .replace(/연결되어\s*있으나/g, '연결 ·')

    .replace(/\(\s*추천\s*\)\s*/g, '')
    .replace(/\(\s*U\s*턴\s*\)/gi, ' → U턴 후 ')
    .replace(/방향\s*\(\s*(\d+(?:\.\d+)?)m\s*직진\s*\)/g, '방향 $1m')
    .replace(/\(\s*(\d+(?:\.\d+)?)m\s*직진\s*\)/g, '$1m')
    .replace(/\(\s*도보\s*(약\s*)?(\d+)\s*분(?:\s*거리)?\s*\)/g, ' · 도보 $1$2분')
    .replace(/\(\s*(\d+(?:\.\d+)?)m\s*\)/g, ' · $1m')
    .replace(/^([^()]*)\(([^()]*(?:직진|도보|방향|진입|엘리베이터|E\/V)[^()]*)\)(.*)$/i, '$1 → $2 $3')

    .replace(/([가-힣A-Za-z0-9·(),]+역(?:\([^)]*\))?)\s*하차/g, '$1에서 내려')
    .replace(/([가-힣A-Za-z0-9·]+\s*정류장)\s*하차/g, '$1에서 내려')
    .replace(/(\d+번 출구)(?:를)?\s*이용/g, '$1')
    .replace(/(\d+번 출구)로\s*나와/g, '$1 →')
    .replace(/(\d+번 출구)에서\s*(?:나와|나온\s*후|이동(?:하여|한\s*후)?)?\s*/g, '$1 → ')
    .replace(/([가-힣A-Za-z0-9·()]+역)\s+(\d+번 출구)/g, '$1 → $2')
    .replace(/하차\s*(?:후|하여|한\s*후)\s*,?\s*/g, '하차 → ')

    .replace(/\s+지나\s+/g, ' → ')
    .replace(/직진(?:한)?\s*후/g, '직진 →')
    .replace(/좌회전(?:하여|해|한\s*후)?/g, '좌회전 →')
    .replace(/우회전(?:하여|해|한\s*후)?/g, '우회전 →')
    .replace(/횡단보도(?:를)?\s*(?:이용|건넌|건너간)\s*(?:후)?/g, '횡단보도 건너')
    .replace(/문\s*통과\s*후/g, '문 통과 →')
    .replace(/통과\s*후/g, '통과 →')
    .replace(/진입\s*후/g, '진입 →')
    .replace(/이동\s*후/g, '이동 →')
    .replace(/환승\s*후/g, '환승 →')
    .replace(/승차\s*후/g, '승차 →')
    .replace(/이용\s*후/g, '이용 →')
    .replace(/탑승\s*후/g, '탑승 →')
    .replace(/나온\s*후|나오신\s*후|나와서/g, '나와 →')
    .replace(/밖으로\s*이동/g, '밖으로 나와')

    .replace(/지하상가\s*이용\s*직선\s*도보\s*(\d+(?:\.\d+)?m)\s*이동/g, '지하상가 경로 · $1 도보')
    .replace(/직선거리\s*(\d+(?:\.\d+)?m)\s*도보\s*이동/g, '$1 도보')
    .replace(/([^→,]+?)\s+출입문\s+진입/g, '$1 출입문으로 진입')
    .replace(/([^→,]+?)\s+건물\s+진입/g, '$1 건물로 진입')
    .replace(/((?:\d+(?:\s*[-~]\s*\d+)?호기)\s+)?엘리베이터\s*(?:를\s*)?(?:탑승|이용)(?:하여|해)?\s*(\d+층)(?:으로)?\s*(?:이동)?/g, '$1엘리베이터로 $2')
    .replace(/((?:\d+(?:\s*[-~]\s*\d+)?호기)\s+)?E\/V\s*(?:를\s*)?(?:탑승|이용)(?:하여|해)?\s*(\d+층)(?:으로)?\s*(?:이동)?/gi, '$1E/V로 $2')
    .replace(/엘리베이터\s*(?:탑승|이용)\s*→\s*(\d+층)(?:\s*이동)?/g, '엘리베이터로 $1')
    .replace(/E\/V\s*(?:탑승|이용)\s*→\s*(\d+층)(?:\s*이동)?/gi, 'E/V로 $1')
    .replace(/엘리베이터(?:를)?\s*(?:탑승|이용)(?!\s*\d+층)/g, '엘리베이터')
    .replace(/E\/V(?:를)?\s*(?:탑승|이용)(?!\s*\d+층)/gi, 'E/V')
    .replace(/에스컬레이터(?:를)?\s*이용/g, '에스컬레이터')
    .replace(/E\/S(?:를)?\s*이용/gi, 'E/S')
    .replace(/연결\s*통로(?:를)?\s*이용/g, '연결통로')
    .replace(/출입구(?:를)?\s*이용/g, '출입구')
    .replace(/게이트(?:를)?\s*이용/gi, '게이트')
    .replace(/(\d+층)\s*이동/g, '$1')

    .replace(/버스\s*탑승/g, '버스 승차')
    .replace(/\b탑승\b/g, '승차')
    .replace(/버스\s*이용/g, '버스')

    .replace(/직진\s*(\d+(?:\.\d+)?)m/g, '$1m 직진')
    .replace(/(?:도보로|도보)\s*(약\s*)?(\d+)\s*분\s*(?:소요|거리)/g, '도보 $1$2분')
    .replace(/(\d+(?:\.\d+)?)m\s*도보\s*이동/g, '$1m 도보')
    .replace(/(\d+(?:\.\d+)?)m\s*이동/g, '$1m')
    .replace(/도보\s*이동/g, '도보')
    .replace(/도보\s*약\s*(\d+)분\s*거리/g, '도보 약 $1분')
    .replace(/방면으로\s*이동/g, '방면')
    .replace(/방향으로\s*이동/g, '방향')
    .replace(/방향\s*이동/g, '방향')
    .replace(/이용\s*시\s*[:：]?/g, '')
    .replace(/이용(?:하여|해)\s+/g, '이용 → ')

    .replace(/\s*(?:오시면|가시면|이동하시면|진입하시면)\s*됩니다[.!]?$/g, '')
    .replace(/\s*(?:해\s*주세요|해주세요|해주시기\s*바랍니다|바랍니다)[.!]?$/g, '')

    .replace(/\s*(?:-?>|→|▷)\s*/g, ' → ')
    .replace(/\s*→\s*→\s*/g, ' → ')
    .replace(/→\s*,/g, '→ ')
    .replace(/\s*:\s*/g, ' · ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^→\s*|\s*→$/g, '')
    .trim();

  // 사실 단어만 나열된 긴 원문은 구두점만 바뀌면 여전히 복사처럼 보인다.
  // 의미가 같은 짧은 길찾기 용어로 한 번 더 바꿔 원문 문장 구조를 남기지 않는다.
  if (compactForCompare(line) === compactForCompare(originalLine) && compactForCompare(line).length >= 28) {
    if (/왼쪽|오른쪽/.test(line)) {
      line = line.replace(/왼쪽/g, '좌측').replace(/오른쪽/g, '우측');
    } else if (/방향/.test(line)) {
      line = line.replace(/방향/g, '방면');
    } else if (/직진/.test(line)) {
      line = line.replace(/직진/g, '곧장 이동');
    } else if (/도보/.test(line)) {
      line = line.replace(/도보/g, '걸어서');
    } else if (/이동/.test(line)) {
      line = line.replace(/이동/g, '진행');
    }
  }

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

      if (/^(?:[#■]\s*|\[|<)?[^\n\]>*]*지하철(?:\s*이용\s*시|\s*안내)?[\]>]?\s*$/.test(plain)) {
        inSubway = true;
        return original;
      }
      if (/^(?:[#■]\s*|\[|<)?[^\n\]>*]*버스(?:\s*이용\s*시|\s*안내)?[\]>]?\s*$/.test(plain)) {
        inSubway = false;
        return original;
      }

      const clearlySubway =
        (/\d{1,2}\s*호선/.test(plain) && /(?:역|출구)/.test(plain)) ||
        (/(?:경의중앙선|수인.?분당선|신분당선|공항철도|경춘선|에버라인선)/.test(plain) && /(?:역|출구)/.test(plain));
      return inSubway || clearlySubway ? rewriteSubwayLine(original) : original;
    })
    .join('\n');
}

function rewritePossibleSubwayInParking(value: string | null): string | null {
  if (!value || !/(?:지하철|\d{1,2}\s*호선|경의중앙선|수인.?분당선|신분당선|공항철도|경춘선)/.test(value)) {
    return value;
  }
  return rewriteRawSubway(value);
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
    parking: {
      ...branch.parking,
      raw: rewritePossibleSubwayInParking(branch.parking.raw),
      guide: rewritePossibleSubwayInParking(branch.parking.guide),
      howTo: rewritePossibleSubwayInParking(branch.parking.howTo),
      fee: rewritePossibleSubwayInParking(branch.parking.fee),
    },
  };
}
