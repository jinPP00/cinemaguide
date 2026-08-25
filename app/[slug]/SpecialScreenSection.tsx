import Link from 'next/link';
import { guidePath, GUIDES } from '@/lib/paths';
import { specialFares, won } from '@/lib/fares';
import { screenKind } from '@/lib/screens';
import type { Branch } from '@/lib/types';

/**
 * 특별관 요금은 기본관과의 우열·차액을 판단하지 않고 실제 금액만 보여준다.
 * 상세페이지에서 가격 평가 문구가 반복되는 것을 줄이고, 사용자가 표를 보고
 * 직접 판단할 수 있게 한다.
 */
export default function SpecialScreenSection({ branch }: { branch: Branch }) {
  const fares = specialFares(branch);
  if (fares.length === 0) return null;

  const described = branch.specialScreens
    .map((name) => screenKind(name))
    .filter((k): k is NonNullable<typeof k> => k != null && k.desc != null);

  return (
    <section className="section" aria-labelledby="special-screens">
      <h2 id="special-screens">특별관 요금 안내</h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        평일 일반 시간대 성인 기준입니다. 실제 결제 금액은 상영 시간과 좌석 유형에 따라 달라질 수 있습니다.
      </p>

      <div className="table-scroll" style={{ marginTop: 14 }}>
        <table className="fare-table">
          <thead>
            <tr>
              <th scope="col">상영관</th>
              <th scope="col">성인 요금</th>
            </tr>
          </thead>
          <tbody>
            {fares.map((f) => (
              <tr key={f.label}>
                <th scope="row">{f.label}</th>
                <td>{won(f.adult)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {described.length > 0 && (
        <dl className="screen-notes">
          {described.map((k) => (
            <div key={k.name}>
              <dt>{k.name}</dt>
              <dd>{k.desc}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="card-sub" style={{ marginTop: 14 }}>
        전국 특별관 종류와 운영 지점은 <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>에서 확인할 수 있습니다.
      </p>
    </section>
  );
}
