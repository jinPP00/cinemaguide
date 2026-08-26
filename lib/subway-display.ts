import type { Branch } from './types';

/**
 * 지하철 안내는 공식 원문의 사실만 사용하되 화면에서는 짧은 길찾기 문법으로 다시 쓴다.
 * 역명·노선·출구·거리·건물명·층수·방향은 바꾸지 않고, 원문 특유의 조사·존댓말·
 * 반복 동사·괄호형 동선을 정리한다. 원본 JSON은 수정하지 않는다.
 */
function rewriteSubwayLine(input: string): string {
  const label = input.match(/^(\[[^\]]+\]\s*)/);
  let prefix = label?.[1] ?? '';
  let line = label ? input.slice(label[0].length).trim() : input.trim();

  // 안내 조건 라벨도 같은 뜻의 짧은 표현으로 바꾼다.
  prefix = prefix
    .replace(/영업\s*시간\s*외/g, '영업 종료 후')
    .replace(/영업시간\s*외/g, '영업 종료 후')
    .replace(/영업\s*시간\s*내/g, '영업 중')
    .replace(/영업시간\s*내/g, '영업 중')
    .replace(/이용\s*방법/g, '이용');

  line = line
    // 원문에서 자주 보이는 장식·중복 단어를 걷어낸다.
    .replace(/[‘’“”＂"]/g, '')
    .replace(/\s*\|\s*/g, ' · ')
    .replace(/^지하철\s*/g, '')
    .replace(/(^|[\s:：])지하철\s+(?=\d|[가-힣]+선)/g, '$1')
    .replace(/엘레베이터|엘리베이타/g, '엘리베이터')
    .replace(/(\d+)\s*번\s*출구/g, '$1번 출구')
    .replace(/(\d+(?:\.\d+)?)\s*(?:미터|[mM])(?=\s|$|[),·→>])/g, '$1m')
    .replace(/도보\s*직진|도보직진|도보로\s*직진/g, '직진')
    .replace(/우측\s*방향/g, '우측')
    .replace(/좌측\s*방향/g, '좌측')
    .replace(/오른쪽\s*방향/g, '우측')
    .replace(/왼쪽\s*방향/g, '좌측')
    .replace(/북서\s*방향/g, '북서쪽')

    // 영업시간 조건·운영 문구는 짧은 보조정보로 바꾼다.
    .replace(/영업\s*시간\s*외/g, '영업 종료 후')
    .replace(/영업시간\s*외/g, '영업 종료 후')
    .replace(/영업\s*시간\s*내/g, '영업 중')
    .replace(/영업시간\s*내/g, '영업 중')
    .replace(/입점\s*건물\s*영업시간\s*전\s*\/\s*후/g, '건물 영업 전·후')
    .replace(/(\d+시(?:\s*\d+분)?)\s*이전/g, '$1 전')
    .replace(/(\d+시(?:\s*\d+분)?)\s*이후/g, '$1 후')
    .replace(/통행\s*제한될\s*수\s*있으니/g, '통행 제한 가능 ·')
    .replace(/연결되어\s*있으나/g, '연결 ·')

    // 괄호 안에 들어간 실제 이동 단계는 밖으로 꺼낸다.
    .replace(/\(\s*U\s*턴\s*\)/gi, ' → U턴 후 ')
    .replace(/방향\s*\(\s*(\d+(?:\.\d+)?)m\s*직진\s*\)/g, '방향 $1m')
    .replace(/\(\s*(\d+(?:\.\d+)?)m\s*직진\s*\)/g, '$1m')
    .replace(/\(\s*도보\s*(약\s*)?(\d+)\s*분(?:\s*거리)?\s*\)/g, ' · 도보 $1$2분')
    .replace(/\(\s*(\d+(?:\.\d+)?)m\s*\)/g, ' · $1m')
    .replace(/^([^()]*)\(([^()]*(?:직진|도보|방향|진입|엘리베이터|E\/V)[^()]*)\)(.*)$/i, '$1 → $2 $3')

    // 역과 출구는 `역 → 출구` 구조로 통일한다.
    .replace(/([가-힣A-Za-z0-9·()]+역)에서\s*하차/g, '$1')
    .replace(/([가-힣A-Za-z0-9·()]+역)\s*하차/g, '$1')
    .replace(/(\d+번 출구)(?:를)?\s*이용/g, '$1')
    .replace(/(\d+번 출구)로\s*나와/g, '$1 →')
    .replace(/(\d+번 출구)에서\s*(?:나와|나온\s*후|하차(?:하여|한\s*후)?|이동(?:하여|한\s*후)?)?\s*/g, '$1 → ')
    .replace(/([가-힣A-Za-z0-9·()]+역)\s+(\d+번 출구)/g, '$1 → $2')
    .replace(/하차\s*(?:후|하여|한\s*후)\s*,?\s*/g, '하차 → ')

    // 길찾기 동사를 결과 중심의 짧은 단계로 바꾼다.
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

    // 건물·출입구·수직 이동은 `장소 → 층` 위주로 줄인다.
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

    // 버스가 섞인 지하철 안내도 중복 동사만 줄이고 노선·정류장은 그대로 둔다.
    .replace(/버스\s*탑승/g, '버스 승차')
    .replace(/\b탑승\b/g, '승차')
    .replace(/버스\s*이용/g, '버스')

    // 거리·소요시간·방향 표현을 간결하게 만든다.
    .replace(/직진\s*(\d+(?:\.\d+)?)m/g, '$1m 직진')
    .replace(/(?:도보로|도보)\s*(약\s*)?(\d+)\s*분\s*(?:소요|거리)/g, '도보 $1$2분')
    .replace(/(\d+(?:\.\d+)?)m\s*도보\s*이동/g, '$1m 도보')
    .replace(/도보\s*이동/g, '도보')
    .replace(/도보\s*약\s*(\d+)분\s*거리/g, '도보 약 $1분')
    .replace(/방면으로\s*이동/g, '방면')
    .replace(/방향으로\s*이동/g, '방향')
    .replace(/방향\s*이동/g, '방향')
    .replace(/이용\s*시\s*[:：]?/g, '')
    .replace(/이용(?:하여|해)\s+/g, '이용 → ')

    // 안내문 어미는 삭제하고 경로 정보만 남긴다.
    .replace(/\s*(?:오시면|가시면|이동하시면|진입하시면)\s*됩니다[.!]?$/g, '')
    .replace(/\s*(?:해\s*주세요|해주세요|해주시기\s*바랍니다|바랍니다)[.!]?$/g, '')

    // 모든 동선 구분자는 같은 화살표로 표시한다.
    .replace(/\s*(?:-?>|→|▷)\s*/g, ' → ')
    .replace(/\s*→\s*→\s*/g, ' → ')
    .replace(/→\s*,/g, '→ ')
    .replace(/\s*:\s*/g, ' · ')
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

      // 마커가 없는 raw도 노선/역/출구가 함께 있어 지하철임이 분명한 줄만 처리한다.
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
    // 일부 지점은 수집 경계 때문에 지하철 안내가 parking raw에 섞여 있다.
    // 화면 파서가 그 조각을 되찾기 전에 같은 문장 정리를 적용한다.
    parking: {
      ...branch.parking,
      raw: rewritePossibleSubwayInParking(branch.parking.raw),
      guide: rewritePossibleSubwayInParking(branch.parking.guide),
      howTo: rewritePossibleSubwayInParking(branch.parking.howTo),
      fee: rewritePossibleSubwayInParking(branch.parking.fee),
    },
  };
}
