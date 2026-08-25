import { fareSpread, won } from '@/lib/fares';
import type { Branch } from '@/lib/types';

/**
 * 이 지점에서 가장 싸게 보는 조합.
 *
 * 요금표는 지점당 수십 줄이라 눈으로 훑어서는 "제일 싸게 보려면 언제 어느 관에
 * 가야 하나"가 안 보인다. 그 한 줄을 뽑아준다. 각 브랜드 공식 사이트도 자기
 * 요금표를 보여줄 뿐 이 계산은 해주지 않는다.
 */
export default function CheapestNote({ branch }: { branch: Branch }) {
  const s = fareSpread(branch);
  if (!s) return null;

  // 시간대 이름이 '일반'이면 라벨과 겹쳐 "주말 일반 일반(2D)"처럼 읽힌다.
  // 그 경우는 요일만 남긴다.
  const describe = (c: typeof s.cheapest) =>
    [c.dayType, c.timeSlot === '일반' ? null : c.timeSlot].filter(Boolean).join(' ');
  const when = describe(s.cheapest);
  const priciestWhen = describe(s.priciest);

  return (
    <p className="fare-standing">
      가장 싼 조합은 <strong>{when} {s.cheapest.label} {won(s.cheapest.adult)}</strong>입니다.
      {s.saving > 0 && (
        <> 평일 일반 시간대({won(s.base)})보다 {won(s.saving)} 쌉니다.</>
      )}{' '}
      요금표에서 가장 비싼 줄은 {priciestWhen} {s.priciest.label} {won(s.priciest.adult)}입니다.
    </p>
  );
}
