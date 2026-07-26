import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, brandPath } from '@/lib/data';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: '사이트 소개',
  description:
    '영화관 지점안내가 어떤 정보를 어떻게 수집하고 정리하는지, 무엇을 하지 않는지 설명합니다.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>사이트 소개</li>
        </ol>
      </nav>

      <h1>사이트 소개</h1>

      <div className="prose">
        <p>
          {SITE.name}은 CGV·롯데시네마·메가박스 전국 {meta.totalBranches}개 지점의 위치와 교통,
          주차, 관람료 정보를 지점 단위로 정리해 제공하는 정보 안내 사이트입니다. 영화를 보러 가기
          전에 확인하게 되는 실용 정보를 한 곳에서 볼 수 있도록 만들었습니다.
        </p>

        <h2>이 사이트를 만든 이유</h2>
        <p>
          영화관 지점 정보는 브랜드별 공식 사이트에 각각 흩어져 있습니다. 상영시간표는 쉽게 찾을
          수 있지만, 그 지점에 차를 가져가도 되는지, 주차비가 얼마나 나오는지, 지하철역에서 얼마나
          걸리는지 같은 정보는 여러 단계를 눌러 들어가야 나오는 경우가 많습니다. 브랜드가 다르면
          같은 정보를 또 다른 방식으로 찾아야 합니다.
        </p>
        <p>
          이 사이트는 그 정보를 지점 단위로 모아 같은 형식으로 정리합니다. 브랜드를 고르면 시도별
          지점 목록이 나오고, 지점을 선택하면 해당 지점의 정보를 한 화면에서 확인할 수 있습니다.
        </p>

        <h2>제공하는 정보</h2>
        <ul>
          <li>지점 주소와 지도 위치</li>
          <li>대중교통 이용 방법 (지하철·버스)</li>
          <li>주차 위치, 무료 시간, 초과 요금, 정산 방법</li>
          <li>상영관 종류별·시간대별 관람료</li>
          <li>공식 상영시간표 및 예매 페이지 바로가기</li>
        </ul>

        <h2>하지 않는 것</h2>
        <p>
          이 사이트는 예매, 결제, 좌석 선택 기능을 제공하지 않습니다. <strong>실시간 상영시간표도
          직접 제공하지 않습니다.</strong> 상영시간표는 하루에도 여러 번 바뀌는 정보라, 이 사이트에
          옮겨 적으면 오히려 틀린 정보를 보여드릴 위험이 큽니다. 대신 각 지점 페이지 상단에서 해당
          지점의 공식 예매 페이지로 바로 이동할 수 있게 해두었습니다.
        </p>
        <p>
          또한 이 사이트는 각 영화관 브랜드의 공식 서비스가 아니며, 어떤 브랜드와도 제휴·위탁·대행
          관계에 있지 않습니다. 자세한 내용은 <Link href="/disclaimer/">면책 고지</Link>를 참고해
          주세요.
        </p>

        <h2>정보 수집과 확인 방법</h2>
        <p>
          지점 정보는 각 브랜드의 공식 웹사이트에 공개된 내용을 기준으로 정리합니다. 공식 사이트에
          없는 항목은 임의로 채우지 않고 표시하지 않으며, 확인되지 않은 내용은 추측해서 쓰지
          않습니다.
        </p>
        <h3>정보 갱신 주기</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>변동성</th>
                <th>갱신 주기</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>지점 목록·주소</td>
                <td>낮음</td>
                <td>6개월</td>
              </tr>
              <tr>
                <td>교통·주차 안내</td>
                <td>보통</td>
                <td>3개월</td>
              </tr>
              <tr>
                <td>관람료</td>
                <td>높음</td>
                <td>1~3개월</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>정보의 한계</h2>
        <p>
          요금, 주차 정책, 운영 시간은 각 영화관의 사정에 따라 예고 없이 바뀔 수 있습니다. 이
          사이트의 정보는 갱신 시점과 실제 상황 사이에 차이가 있을 수 있으므로 참고용으로
          이용하시고, 결제나 방문 전에는 공식 채널에서 최종 정보를 확인하시기 바랍니다.
        </p>
        <p>
          잘못된 정보를 발견하셨다면 <Link href="/contact/">정정 요청</Link>으로 알려주세요. 확인
          후 바로 수정합니다.
        </p>

        <h2>브랜드별 지점 보기</h2>
        <ul>
          {meta.brands.map((b) => (
            <li key={b.key}>
              <Link href={brandPath(b.segment)}>
                {b.name} 전국 {b.count}개 지점
              </Link>
            </li>
          ))}
        </ul>

        <h2>관련 정책</h2>
        <ul>
          <li>
            <Link href="/disclaimer/">면책 고지</Link> — 공식 서비스와의 관계, 정보 정확성에 대한
            책임 범위
          </li>
          <li>
            <Link href="/affiliate-disclosure/">광고·제휴 고지</Link> — 광고·제휴 링크 운영 방식
          </li>
          <li>
            <Link href="/privacy/">개인정보처리방침</Link>
          </li>
          <li>
            <Link href="/terms/">이용약관</Link>
          </li>
        </ul>

        <h2>운영자</h2>
        <div className="table-scroll">
          <table>
            <tbody>
              <tr>
                <th>사이트명</th>
                <td>{SITE.name}</td>
              </tr>
              <tr>
                <th>운영</th>
                <td>{SITE.operator}</td>
              </tr>
              <tr>
                <th>문의</th>
                <td>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
