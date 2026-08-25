import type { Branch } from '@/lib/types';

/**
 * 가까운 특별관 정보는 이제 `근처 다른 영화관` 표의 특별관 열에 통합한다.
 * 같은 주변 지점을 두 섹션에서 반복하지 않기 위해 별도 섹션은 렌더링하지 않는다.
 */
export default function NoSpecialScreenSection({ branch: _branch }: { branch: Branch }) {
  return null;
}
