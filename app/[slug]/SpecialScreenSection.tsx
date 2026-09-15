import Link from 'next/link';
import { guidePath, GUIDES } from '@/lib/paths';
import { specialFares, won } from '@/lib/fares';
import { screenKind } from '@/lib/screens';
import type { Branch } from '@/lib/types';

/**
 * 이 지점의 특별관을 다루는 유일한 자리. 목록·요금·설명을 여기서만 보여준다.
 *
 * 예전에는 같은 목록이 기본정보(dt 특별관), 이 섹션, FAQ("특별관이 있나요")
 * 세 곳에 있었고, 설명문은 요금표 아래 "상영 방식 차이" 블록과 여기 두 번
 * 나왔다. 셋을 여기로 모았다. 요금표에 특별관 줄이 없는 지점(요금 원본에
 * 특별관 행이 빠진 몇 곳)도 목록과 설명은 있어야 하므로 표 없이 렌더링한다.
 *
 * 특별관 요금은 기본관과의 우열·차액을 판단하지 않고 실제 금액만 보여준다.
 */
export default function SpecialScreenSection({ branch }: { branch: Branch }) {
  if (branch.specialScreens.length === 0) return null;

  const fares = specialFares(branch);
  // 설명은 lib/screens.ts에 확인된 사실이 있는 관만 붙인다. 없는 관은 위의
  // 목록에 이름만 남긴다 — "설명을 확인하지 못했습니다" 같은 자리표시 문장을
  // 수십 페이지에 반복해서 찍지 않기 위해서다.
  const described = branch.specialScreens
    .map((name) => screenKind(name))
    .filter((k): k is NonNullable<typeof k> & { desc: string } => k != null && k.desc != null);

  return (
    <section className="section" aria-labelledby="special-screens">
      <h2 id="special-screens">특별관</h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        {branch.specialScreens.join(', ')}
      </p>

      {fares.length > 0 && (
        <>
          <p className="card-sub" style={{ marginTop: 12 }}>
            평일 일반 시간대 성인 기준 요금입니다. 실제 결제 금액은 상영 시간과 좌석 유형에 따라 달라질 수 있습니다.
          </p>
          <div className="table-scroll" style={{ marginTop: 10 }}>
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
        </>
      )}

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
