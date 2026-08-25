/**
 * 한국어 조사 자동 선택.
 *
 * 영화 제목처럼 값이 매주 바뀌는 자리에는 조사를 문장에 박아둘 수 없다.
 * "은(는)"으로 적고 넘어가면 사람이 쓴 글로 읽히지 않고, 하나로 고정하면
 * "스파이더맨: 브랜드 뉴 데이은"처럼 틀린 문장이 나간다. 앞 단어의 받침을
 * 보고 골라 넣는다.
 */

/** 조사 짝 — [받침 있을 때, 받침 없을 때] */
const PAIRS = {
  은: ['은', '는'],
  이: ['이', '가'],
  을: ['을', '를'],
  과: ['과', '와'],
  으로: ['으로', '로'],
} as const;

export type JosaKind = keyof typeof PAIRS;

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
/** 한글 한 글자는 초성 19 × 중성 21 × 종성 28로 조합된다 */
const FINAL_COUNT = 28;

/** 숫자를 한국어로 읽었을 때 받침으로 끝나는 것 (영·일·삼·육·칠·팔) */
const DIGITS_WITH_FINAL = new Set(['0', '1', '3', '6', '7', '8']);

/**
 * 마지막 글자에 받침이 있는지.
 *
 * 한글과 숫자는 정확히 판정된다. 로마자로 끝나는 제목은 읽는 사람마다
 * 발음이 갈려 규칙이 없으므로, 모음으로 끝나면 받침 없음으로 보는 통상적인
 * 어림짐작을 쓴다.
 */
function hasFinalConsonant(word: string): boolean {
  const last = word.trim().at(-1);
  if (!last) return false;

  const code = last.charCodeAt(0);
  if (code >= HANGUL_START && code <= HANGUL_END) {
    return (code - HANGUL_START) % FINAL_COUNT !== 0;
  }
  if (DIGITS_WITH_FINAL.has(last)) return true;
  if (/[0-9]/.test(last)) return false;
  // 로마자로 끝나면 받침 없음으로 본다. 이 데이터에 나오는 로마자 표기는
  // 한국어로 읽을 때 대부분 모음으로 끝나기 때문이다 — CGV는 씨지비,
  // DOLBY ATMOS는 애트모스, SCREENX는 스크린엑스. page.tsx의
  // subjectParticle()이 같은 근거로 이미 그렇게 정해두었으니 규칙을 맞춘다.
  return false;
}

/**
 * 단어 뒤에 붙일 조사만 돌려준다.
 *
 * "으로"는 받침이 ㄹ일 때도 "로"를 쓴다 — "서울로"이지 "서울으로"가 아니다.
 */
export function josa(word: string, kind: JosaKind): string {
  const [withFinal, withoutFinal] = PAIRS[kind];

  if (kind === '으로') {
    const last = word.trim().at(-1);
    const code = last?.charCodeAt(0) ?? 0;
    const isRieul =
      code >= HANGUL_START && code <= HANGUL_END && (code - HANGUL_START) % FINAL_COUNT === 8;
    if (isRieul) return withoutFinal;
  }

  return hasFinalConsonant(word) ? withFinal : withoutFinal;
}

/** 단어와 조사를 붙여서 돌려준다 */
export function withJosa(word: string, kind: JosaKind): string {
  return `${word}${josa(word, kind)}`;
}
