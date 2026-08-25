import type { Branch } from '@/lib/types';

/**
 * 지역·전국에서 싸다/비싸다를 자동 판정하는 문장은 제거한다.
 * 지점 상세에서는 관람료 표 자체만 보여주고 가격 평가는 하지 않는다.
 */
export default function FareStandingNote({ branch: _branch }: { branch: Branch }) {
  return null;
}
