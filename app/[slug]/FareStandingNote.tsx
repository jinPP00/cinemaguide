import { fareStanding, won } from '@/lib/fares';
import type { Branch } from '@/lib/types';

/**
 * 이 지점 요금이 어느 정도인지 한 문장.
 *
 * 요금표만 놓으면 "14,000원"이라는 숫자뿐이라 비싼지 싼지 알 수 없다. 같은
 * 브랜드 같은 지역 안에서 어디쯤인지를 붙여야 판단할 수 있는데, 그 비교는
 * 그 브랜드 공식 사이트가 자기 지점끼리도 해주지 않는다.
 *
 * 문장은 값의 위치에 따라 갈린다 — 지역 전체가 같은 금액인 곳(서울 CGV는
 * 27곳 중 26곳이 14,000원)에서 "27곳 중 1번째로 싸다"고 하면 사실이지만
 * 아무 의미가 없다.
 */
export default function FareStandingNote({ branch }: { branch: Branch }) {
  const s = fareStanding(branch);
  if (!s) return null;

  const brand = branch.brandName;
  const region = `${branch.sido} ${brand}`;
  const flat = s.sidoLow === s.sidoHigh;
  const cheapest = !flat && s.adult === s.sidoLow;
  const priciest = !flat && s.adult === s.sidoHigh;

  // "가장 싼 금액"만 적으면 서울 CGV처럼 27곳 중 26곳이 같은 값인 곳에서
  // 사실이지만 오해를 준다 — 지역 범위와 같은 금액인 지점 수를 함께 밝힌다.
  const same = s.sameCount > 1 ? ` 같은 금액인 지점이 ${s.sameCount}곳입니다.` : '';
  const position = flat
    ? `${region} ${s.sidoCount}곳이 모두 같은 금액입니다.`
    : cheapest
      ? `${region} ${s.sidoCount}곳 중 가장 싼 금액입니다. 지역 최고는 ${won(s.sidoHigh)}입니다.${same}`
      : priciest
        ? `${region} ${s.sidoCount}곳 중 가장 비싼 금액입니다. 지역 최저는 ${won(s.sidoLow)}입니다.${same}`
        : `${region} 지점 요금은 ${won(s.sidoLow)}부터 ${won(s.sidoHigh)}까지인데 이 지점은 그 중간입니다.${same}`;

  return (
    <p className="fare-standing">
      {/* 기준관이 일반관이 아닌 지점이 있어서(리클라이너관·컴포트관만 운영)
          무엇을 기준으로 잰 값인지 밝힌다. */}
      평일 일반 시간대 성인 {won(s.adult)}
      {s.label !== '일반(2D)' && s.label !== '2D 일반석' && s.label !== '일반 2D' && (
        <span className="fare-note"> {s.label} 기준</span>
      )}{' '}
      — {position} 전국 {brand} 지점은 {won(s.nationalLow)}부터 {won(s.nationalHigh)}까지
      있습니다.
    </p>
  );
}
