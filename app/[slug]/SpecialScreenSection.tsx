import Link from 'next/link';
import { guidePath, GUIDES } from '@/lib/paths';
import { baseFare, specialFares, won } from '@/lib/fares';
import { screenKind } from '@/lib/screens';
import type { Branch } from '@/lib/types';

/**
 * 이 지점 특별관이 기본관보다 얼마나 비싼지.
 *
 * 공식 사이트는 특별관을 소개하는 페이지와 요금을 안내하는 페이지가 따로
 * 있어서, "4DX가 얼마나 더 비싼가"를 알려면 두 곳을 오가며 직접 빼야 한다.
 * 여기서는 그 뺄셈을 미리 해둔다 — data/prices.json에서 계산되는 값이라
 * 우리가 새로 지어내는 내용이 하나도 없다.
 */
export default function SpecialScreenSection({ branch }: { branch: Branch }) {
  const base = baseFare(branch);
  const fares = specialFares(branch);
  if (!base || fares.length === 0) return null;

  // 특별관 이름(specialScreens)이 아니라 요금표 라벨을 기준으로 보여준다.
  // 같은 4DX라도 좌석 등급이 나뉜 지점이 있어서, 이름만 묶으면 실제로
  // 결제하는 금액이 어느 줄인지 알 수 없게 된다.
  const described = branch.specialScreens
    .map((name) => screenKind(name))
    .filter((k): k is NonNullable<typeof k> => k != null && k.desc != null);

  return (
    <section className="section" aria-labelledby="special-screens">
      <h2 id="special-screens">특별관은 얼마나 더 비싼가</h2>
      <p className="card-sub" style={{ marginTop: 4 }}>
        평일 일반 시간대 성인 요금이며, 차액은 이 지점 {base.label} {won(base.weekdayAdult)}을
        기준으로 계산했습니다.
      </p>

      <div className="table-scroll" style={{ marginTop: 14 }}>
        <table className="fare-table">
          <thead>
            <tr>
              <th scope="col">상영관</th>
              <th scope="col">성인</th>
              <th scope="col">차액</th>
            </tr>
          </thead>
          <tbody>
            {fares.map((f) => (
              <tr key={f.label}>
                <th scope="row">{f.label}</th>
                <td>{won(f.adult)}</td>
                <td>
                  {/* 기준관보다 싼 특별관이 실제로 있다(구의이스트폴 메가박스는
                      일반관이 없어 리클라이너관이 기준이고 LED관이 그보다 싸다).
                      부호를 그대로 이어 붙이면 "+-1,000원"이 나가므로 분기한다. */}
                  {f.extra === 0 ? (
                    <span className="fare-same">같음</span>
                  ) : f.extra > 0 ? (
                    <span className="fare-extra">+{won(f.extra)}</span>
                  ) : (
                    <span className="fare-cheaper">{won(-f.extra)} 저렴</span>
                  )}
                </td>
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
        전국 특별관이 종류별로 어디에 몇 곳 있고 추가요금이 얼마인지는{' '}
        <Link href={guidePath(GUIDES.screens)}>특별관 안내</Link>에 정리했습니다.
      </p>
    </section>
  );
}
