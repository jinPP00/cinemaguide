import { parkingSummary } from '@/lib/parking';
import type { Branch } from '@/lib/types';

/**
 * 주차 안내의 핵심만 먼저 보여주는 요약.
 *
 * 아래 카드에 있는 원문은 층별 진입 동선·예외 조항까지 담고 있어서 필요한
 * 사람에게는 그대로 필요하지만, 대부분은 "얼마나 무료고 넘기면 얼마인가"만
 * 알면 된다. 그 두 줄을 찾으려고 열 줄을 읽게 하지 않는다.
 *
 * 값은 lib/parking.ts가 원문에서 문자 그대로 뽑은 것만 쓴다. 못 찾은 항목은
 * 줄을 만들지 않으므로, 요약에 없는 내용은 아래 원문에서 확인하면 된다.
 */
export default function ParkingFacts({ branch }: { branch: Branch }) {
  const s = parkingSummary(branch);
  if (!s) return null;

  const rows: { label: string; value: string }[] = [];
  if (s.free) rows.push({ label: '무료 주차', value: `영화 관람 시 ${s.free}` });
  if (s.flat) rows.push({ label: '관람 시 요금', value: s.flat });
  if (s.overage) rows.push({ label: '초과 요금', value: s.overage });
  if (s.verify) rows.push({ label: '인증 방법', value: s.verify });
  if (rows.length === 0) return null;

  return (
    <dl className="parking-facts">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
