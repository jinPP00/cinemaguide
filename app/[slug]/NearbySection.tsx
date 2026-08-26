import Link from 'next/link';
import { branchPath } from '@/lib/data';
import { nearbyBranches, formatDistance } from '@/lib/geo';
import type { Branch } from '@/lib/types';

export default function NearbySection({ branch }: { branch: Branch }) {
  const nearby = nearbyBranches(branch);
  if (nearby.length === 0) return null;

  const nearest = nearby[0].km;
  const isIsolated = nearest > 3;

  return (
    <section className="section" aria-labelledby="nearby-cinemas">
      <h2 id="nearby-cinemas">{branch.name} {branch.brandName} 근처 다른 영화관</h2>
      <p className="section-kicker">
        {isIsolated
          ? `주변 3km 안에는 다른 영화관이 없습니다. 가장 가까운 영화관은 ${formatDistance(nearest)} 거리입니다.`
          : '가까운 순서이며, 거리는 영화관 좌표를 기준으로 한 직선거리입니다.'}
      </p>

      <div className="data-table-shell">
        <table className="data-table data-table--nearby">
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
                <th scope="row"><Link className="guide-inline-link" href={branchPath(other)}>{other.name} {other.brandName}</Link></th>
                <td>{formatDistance(km)}</td>
                <td>{other.address}</td>
                <td className="muted">{other.specialScreens.length > 0 ? other.specialScreens.join(', ') : '일반관'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
