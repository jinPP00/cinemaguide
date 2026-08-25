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
 * 새 데이터를 구하지 않고 계산만으로 만들 수 있고, 계산 결과라 시간이
 * 지나도 틀어지지 않는다.
 *
 * 요금을 함께 붙이는 이유: "근처에 뭐가 있다"보다 "근처가 더 싼가"가 실제로
 * 궁금한 것이고, 그 답은 세 브랜드 요금표를 나란히 놓아야만 나온다.
 */
export default function NearbySection({ branch }: { branch: Branch }) {
  const nearby = nearbyBranches(branch);
  if (nearby.length === 0) return null;

  const here = baseFare(branch);
  const farthestFirst = nearby[0].km;
  // 반경 안에 아무것도 없어 가장 가까운 한 곳만 끌어온 경우다. 이때는 목록을
  // 보여주기 전에 "주변에 없다"는 사실부터 말해야 오해가 없다.
  const isIsolated = farthestFirst > 3;

  return (
    <section className="section" aria-labelledby="nearby-cinemas">
      <h2 id="nearby-cinemas">근처 다른 영화관</h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        {isIsolated
          ? `${branch.name} ${branch.brandName} 주변 3km 안에는 다른 영화관이 없습니다. 가장 가까운 곳은 ${formatDistance(farthestFirst)} 떨어져 있습니다.`
          : '보려던 회차가 매진이거나 시간이 안 맞을 때 쓰도록, 가까운 순서로 정리했습니다. 거리는 지도상 직선거리입니다.'}
      </p>

      <div className="nearby-list">
        {nearby.map(({ branch: other, km }) => {
          const fare = baseFare(other);
          const gap = here && fare ? fare.weekdayAdult - here.weekdayAdult : null;

          return (
            <Link key={other.id} href={branchPath(other)} className="nearby-item">
              <span className="nearby-dist">{formatDistance(km)}</span>
              <span className="nearby-body">
                <span className="nearby-name">
                  {other.name} {other.brandName}
                </span>
                <span className="nearby-meta">
                  {fare ? (
                    <>
                      평일 성인 {won(fare.weekdayAdult)}
                      {/* 일반관이 없어 리클라이너관·컴포트관을 기준으로 잡은 지점은
                          그 사실을 밝혀야 한다 — 안 그러면 일반관 요금과 나란히
                          놓여서 "여기가 3,000원 비싸다"로 잘못 읽힌다. */}
                      {(fare.isFallback || here?.isFallback) && (
                        <span className="fare-note"> {fare.label} 기준</span>
                      )}
                      {gap !== null && gap !== 0 && !fare.isFallback && !here?.isFallback && (
                        <span className={gap < 0 ? 'nearby-cheaper' : 'nearby-pricier'}>
                          {gap < 0 ? ` ${won(Math.abs(gap))} 저렴` : ` ${won(gap)} 비쌈`}
                        </span>
                      )}
                    </>
                  ) : (
                    '요금 정보 준비 중'
                  )}
                  {other.specialScreens.length > 0 && ` · ${other.specialScreens.slice(0, 2).join(', ')}`}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {here && (
        <p className="card-sub" style={{ marginTop: 14 }}>
          요금은 각 지점 기준 상영관의 평일 일반 시간대 성인가입니다. 지역별 3사 요금
          차이는 <Link href={guidePath(GUIDES.fares)}>관람료 비교</Link>에서 볼 수 있습니다.
        </p>
      )}
    </section>
  );
}
