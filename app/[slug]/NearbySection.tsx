import Link from 'next/link';
import { branchPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { nearbyBranches, formatDistance } from '@/lib/geo';
import { baseFare, won } from '@/lib/fares';
import type { Branch } from '@/lib/types';

/**
 * 근처 다른 영화관.
 *
 * 3사 공식 사이트는 구조상 자사 지점만 보여준다. 좌표는 425곳 전부 갖고
 * 있으므로(data/meta.json counts.좌표없음 = 0) 브랜드를 가로지르는 이 목록은
 * 새 데이터를 구하지 않고 계산만으로 만들 수 있고, 계산 결과라 시간이 지나도
 * 틀어지지 않는다.
 *
 * 목록이 아니라 표인 이유: "근처에 뭐가 있다"까지는 목록으로 되지만, 정작
 * 궁금한 건 "거기가 더 싼가, 거기엔 IMAX가 있나"이고 그건 항목을 나란히
 * 놓아야 보인다.
 */
export default function NearbySection({ branch }: { branch: Branch }) {
  const nearby = nearbyBranches(branch);
  if (nearby.length === 0) return null;

  const here = baseFare(branch);
  const nearest = nearby[0].km;
  // 반경 안에 아무것도 없어 가장 가까운 한 곳만 끌어온 경우다. 이때는 목록을
  // 보여주기 전에 "주변에 없다"는 사실부터 말해야 오해가 없다.
  const isIsolated = nearest > 3;

  const rows = nearby.map(({ branch: other, km }) => {
    const fare = baseFare(other);
    // 기준 상영관이 서로 다르면(일반관 없이 리클라이너관만 운영하는 지점 등)
    // 차액을 내밀면 안 된다 — 다른 것끼리 뺀 값이라 잘못 읽힌다.
    const comparable = here != null && fare != null && !here.isFallback && !fare.isFallback;
    return { other, km, fare, gap: comparable ? fare!.weekdayAdult - here!.weekdayAdult : null };
  });
  const cheaper = rows.filter((r) => r.gap != null && r.gap < 0);

  return (
    <section className="section" aria-labelledby="nearby-cinemas">
      <h2 id="nearby-cinemas">
        {branch.name} {branch.brandName} 근처 다른 영화관
      </h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        {isIsolated
          ? `주변 3km 안에는 다른 영화관이 없습니다. 가장 가까운 곳은 ${formatDistance(nearest)} 떨어져 있습니다.`
          : '보려던 회차가 매진이거나 시간이 안 맞을 때 쓰도록 가까운 순서로 정리했습니다. 거리는 지도상 직선거리입니다.'}
      </p>

      <div className="table-scroll" style={{ marginTop: 14 }}>
        <table className="fare-table">
          <thead>
            <tr>
              <th scope="col">영화관</th>
              <th scope="col">거리</th>
              <th scope="col">평일</th>
              <th scope="col">주말</th>
              <th scope="col">특별관</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ other, km, fare, gap }) => (
              <tr key={other.id}>
                <th scope="row">
                  <Link href={branchPath(other)}>
                    {other.name} {other.brandName}
                  </Link>
                </th>
                <td>{formatDistance(km)}</td>
                <td>
                  {fare ? (
                    <>
                      {won(fare.weekdayAdult)}
                      {gap != null && gap !== 0 && (
                        <span className={gap < 0 ? 'nearby-cheaper' : 'nearby-pricier'}>
                          {gap < 0 ? ` ${won(-gap)} 저렴` : ` ${won(gap)} 비쌈`}
                        </span>
                      )}
                      {fare.isFallback && <span className="fare-note">{fare.label} 기준</span>}
                    </>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{fare ? won(fare.weekendAdult) : '-'}</td>
                <td className="fare-range">
                  {other.specialScreens.length > 0 ? other.specialScreens.join(', ') : '없음'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {here && (
        <p className="fare-standing">
          {cheaper.length > 0 ? (
            <>
              이 가운데 {cheaper.length}곳이 {branch.name} {branch.brandName}(
              {won(here.weekdayAdult)})보다 쌉니다 — 가장 싼 곳은 {cheaper[0].other.name}{' '}
              {cheaper[0].other.brandName} {won(cheaper[0].fare!.weekdayAdult)}입니다.
            </>
          ) : (
            <>
              평일 기준으로 근처에서 더 싼 곳은 없습니다. 요금을 낮추려면 브랜드를 옮기는 것보다{' '}
              <Link href={guidePath(GUIDES.fares)}>시간대를 옮기는 쪽</Link>이 효과가 큽니다.
            </>
          )}
        </p>
      )}
    </section>
  );
}
