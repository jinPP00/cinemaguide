import Link from 'next/link';
import { branchPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { nearestWithSpecialScreen, formatDistance } from '@/lib/geo';
import { baseFare, won } from '@/lib/fares';
import type { Branch } from '@/lib/types';

/**
 * 특별관이 없는 지점에서 "그럼 제일 가까운 데는 어디냐"에 답한다.
 *
 * 전국 425곳 중 224곳에 특별관이 없다. 그 페이지에서 "여기엔 없습니다"로
 * 끝내면 찾아온 사람이 빈손으로 나가고, 페이지도 그만큼 비어 보인다. 좌표가
 * 425곳 전부 있으므로 이건 계산으로 답할 수 있다 — 특별관까지 거리는 중앙값
 * 2.8km이고 224곳 중 177곳은 10km 안에 있다.
 *
 * 브랜드를 가리지 않는 것이 핵심이다. 아이맥스를 찾는 사람에게 그게 CGV인지
 * 메가박스인지는 조건이 아닌데, 각 브랜드 공식 사이트는 자사 지점만 보여주므로
 * 이 답을 낼 수가 없다.
 */
export default function NoSpecialScreenSection({ branch }: { branch: Branch }) {
  // 특별관이 있는 지점은 SpecialScreenSection이 요금 차액을 보여준다
  if (branch.specialScreens.length > 0) return null;

  const nearest = nearestWithSpecialScreen(branch);
  if (nearest.length === 0) return null;

  const here = baseFare(branch);

  return (
    <section className="section" aria-labelledby="no-special">
      <h2 id="no-special">
        {branch.name} {branch.brandName}에서 가까운 특별관
      </h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        이 지점은 특별관을 운영하지 않습니다. 아이맥스·4DX처럼 상영관을 골라서
        보려면 아래 지점을 참고하세요. 거리는 지도상 직선거리입니다.
      </p>

      <div className="table-scroll" style={{ marginTop: 14 }}>
        <table className="fare-table">
          <thead>
            <tr>
              <th scope="col">영화관</th>
              <th scope="col">거리</th>
              <th scope="col">특별관</th>
              <th scope="col">평일</th>
            </tr>
          </thead>
          <tbody>
            {nearest.map(({ branch: other, km }) => {
              const fare = baseFare(other);
              const gap =
                here && fare && !here.isFallback && !fare.isFallback
                  ? fare.weekdayAdult - here.weekdayAdult
                  : null;
              return (
                <tr key={other.id}>
                  <th scope="row">
                    <Link href={branchPath(other)}>
                      {other.name} {other.brandName}
                    </Link>
                  </th>
                  <td>{formatDistance(km)}</td>
                  <td className="fare-range">{other.specialScreens.join(', ')}</td>
                  <td>
                    {fare ? (
                      <>
                        {won(fare.weekdayAdult)}
                        {gap != null && gap !== 0 && (
                          <span className={gap < 0 ? 'nearby-cheaper' : 'nearby-pricier'}>
                            {gap < 0 ? ` ${won(-gap)} 저렴` : ` ${won(gap)} 비쌈`}
                          </span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="card-sub" style={{ marginTop: 14 }}>
        상영관 종류별로 기본관보다 얼마나 비싼지는{' '}
        <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>에 정리했습니다.
      </p>
    </section>
  );
}
