import Link from 'next/link';
import { branchPath } from '@/lib/data';
import { nearbyBranches, formatDistance } from '@/lib/geo';
import type { Branch } from '@/lib/types';

/**
 * 근처 다른 영화관.
 *
 * 지점 상세에서 가격 우열을 반복해서 판단하기보다 실제 이동에 필요한 정보에
 * 집중한다. 브랜드를 가로질러 가까운 지점을 거리순으로 보여주고, 주소와 특별관
 * 보유 여부를 함께 제공한다. 가격은 각 지점의 관람료 표에서 확인한다.
 */
export default function NearbySection({ branch }: { branch: Branch }) {
  const nearby = nearbyBranches(branch);
  if (nearby.length === 0) return null;

  const nearest = nearby[0].km;
  const isIsolated = nearest > 3;

  return (
    <section className="section" aria-labelledby="nearby-cinemas">
      <h2 id="nearby-cinemas">
        {branch.name} {branch.brandName} 근처 다른 영화관
      </h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        {isIsolated
          ? `주변 3km 안에는 다른 영화관이 없습니다. 가장 가까운 영화관은 ${formatDistance(nearest)} 거리에 있습니다.`
          : '가까운 순서로 정리했습니다. 거리는 영화관 좌표를 기준으로 한 직선거리입니다.'}
      </p>

      <div className="table-scroll" style={{ marginTop: 14 }}>
        <table className="fare-table nearby-table">
          <thead>
            <tr>
              <th scope="col">영화관</th>
              <th scope="col">거리</th>
              <th scope="col">주소</th>
              <th scope="col">특별관</th>
            </tr>
          </thead>
          <tbody>
            {nearby.map(({ branch: other, km }) => (
              <tr key={other.id}>
                <th scope="row">
                  <Link href={branchPath(other)}>
                    {other.name} {other.brandName}
                  </Link>
                </th>
                <td className="nearby-distance">{formatDistance(km)}</td>
                <td className="nearby-address">{other.address}</td>
                <td className="fare-range">
                  {other.specialScreens.length > 0 ? other.specialScreens.join(', ') : '일반관'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
