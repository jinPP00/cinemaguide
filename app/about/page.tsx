import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, brandPath } from '@/lib/data';
import { SITE } from '@/lib/site';
import { GUIDES, guidePath } from '@/lib/paths';

export const metadata: Metadata = withOpenGraphUrl({
  title: '사이트 소개',
  description:
    '영화관 지점안내가 어떤 정보를 어떻게 수집하고 정리하는지, 데이터 정규화 및 검증 기준과 운영 원칙을 설명합니다.',
  alternates: { canonical: '/about/' },
});

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
          {SITE.name}은 CGV·롯데시네마·메가박스 전국 {meta.totalBranches}개 지점의 위치와 대중교통,
          주차 조건, 관람료, 특별관 정보를 지점 단위로 수집·정규화해 제공하는 독립 영화관 정보 안내
          사이트입니다. 영화를 보러 가기 전에 반드시 확인하게 되는 실용 정보를 3사 공통 기준으로
          한눈에 비교하고 점검할 수 있도록 설계했습니다.
        </p>

        <h2>이 사이트를 만든 이유</h2>
        <p>
          국내 멀티플렉스 3사(CGV·롯데시네마·메가박스)의 지점 안내 정보는 각 브랜드 공식 웹사이트와
          앱에 서로 다른 구조로 흩어져 있습니다. 상영시간표 자체는 포털이나 앱에서 쉽게 볼 수 있지만,
          정작 방문 직전에 필요한 질문들—&ldquo;이 지점에 차를 가져가면 무료 주차가 몇 시간인지&rdquo;,
          &ldquo;티켓 인증은 매표소에서 하는지 주차 정산기에서 바코드를 찍는지&rdquo;,
          &ldquo;같은 지역 다른 브랜드 영화관과 평일·주말·조조 요금이 얼마나 차이 나는지&rdquo;—을
          확인하려면 여러 화면과 탭을 반복해서 오가야 합니다.
        </p>
        <p>
          특히 원문 주차 안내나 대중교통 안내는 브랜드마다, 심지어 같은 브랜드 안에서도 지점마다
          작성 형식이 제각각이어서 필요한 조건만 빠르게 파악하기 어렵습니다. {SITE.name}은 흩어진
          원문 데이터를 수집한 뒤 <strong>동일한 분류 체계(주차 위치·주차 규모·무료 주차·인증 방법·초과 요금·유의사항)</strong>와
          <strong>표준화된 요금표·버스 노선 칩 구조</strong>로 재정리해, 방문자가 1분 안에 핵심 이용 조건을
          파악하고 공식 예매 페이지로 이동할 수 있도록 돕습니다.
        </p>

        <h2>제공하는 핵심 정보와 가이드</h2>
        <ul>
          <li>
            <strong>전국 지점별 상세 안내</strong>: 지점 주소와 지도 길찾기, 상영관·좌석 규모,
            지하철역 출구·도보 경로 및 버스 노선 번호, 주차장 위치·무료 시간·초과 요금·인증 방법,
            상영관 종류별·시간대별(성인·청소년·경로·장애인) 관람료, 반경 내 인접 대안 영화관 비교
          </li>
          <li>
            <Link href={guidePath(GUIDES.fares)}>
              <strong>3사 관람료 비교 가이드</strong>
            </Link>
            : 전국 지점의 요금표를 실제로 집계해 평일·주말·조조 성인 및 청소년 대표 요금과 지역별
            관람료 편차를 비교 분석합니다.
          </li>
          <li>
            <Link href={guidePath(GUIDES.screens)}>
              <strong>특별관 종류·보유 지점 안내</strong>
            </Link>
            : IMAX·돌비 시네마·4DX·스크린X·수퍼플렉스·리클라이너 등 3사 특별관의 기술적 특징과
            전국 운영 지점, 영화 장르별 선택 기준을 안내합니다.
          </li>
          <li>
            <Link href={guidePath(GUIDES.parking)}>
              <strong>영화관 주차·인증 완벽 가이드</strong>
            </Link>
            : 매표소 등록·티켓 바코드 무인정산·웹 사전등록 등 4가지 주차 인증 방식과 상영시간 대비
            무료 주차 시간 계산법, 백화점·쇼핑몰 합산 규칙을 정리합니다.
          </li>
          <li>
            <Link href={guidePath(GUIDES.discounts)}>
              <strong>조조·심야·문화가 있는 날·우대 할인 가이드</strong>
            </Link>
            : 시간대별 요금 구분, 마지막 수요일 문화가 있는 날 적용 조건, 청소년·경로·장애인 우대
            요금 및 지참 증빙 서류를 상세히 설명합니다.
          </li>
          <li>
            <Link href={guidePath(GUIDES.boxoffice)}>
              <strong>일간 박스오피스 순위 안내</strong>
            </Link>
            : 영화진흥위원회 통합전산망(KOBIS) 공식 일별 집계를 바탕으로 현재 상영작 순위와 매출액
            점유율, 관객수 추이를 제공합니다.
          </li>
        </ul>

        <h2>데이터 수집·정규화 및 품질 검증 원칙</h2>
        <p>
          {SITE.name}은 단순 복제가 아닌 <strong>데이터 구조화와 자동·수동 교차 검증</strong>을 통해
          정보 품질을 관리합니다.
        </p>
        <ol>
          <li>
            <strong>공식 출처 기반 수집</strong>: 각 영화관 브랜드의 공식 웹사이트 지점 페이지와
            영화진흥위원회 오픈 API 등 검증 가능한 1차 공식 출처에서만 데이터를 수집합니다. 공식
            사이트에 없는 항목은 임의로 추측해 채우지 않습니다.
          </li>
          <li>
            <strong>규칙 기반 구조화·정규화</strong>: 비정형 텍스트로 적힌 주차 안내문에서 주차 위치,
            수용 가능 대수, 무료 제공 시간, 정액 요금, 추가 과금 단위(10분/15분/30분), 인증 절차,
            차종 제한 및 주의사항을 항목별로 추출해 일관된 표와 목록으로 재구성합니다.
          </li>
          <li>
            <strong>완전성 기준에 따른 색인 관리</strong>: 운영 중인 지점이라도 관람료·대중교통·주차
            핵심 안내 중 하나라도 확인되지 않은 지점은 검색엔진 색인 대상에서 제외(<code>noindex</code>)하여,
            이용자가 검색을 통해 빈 페이지나 준비 중인 페이지에 도달하지 않도록 엄격히 관리합니다.
          </li>
          <li>
            <strong>좌표 기반 인접 극장 교차 계산</strong>: 모든 지점의 위도·경도 좌표를 기반으로
            브랜드와 무관하게 직선거리 기준 가장 가까운 주변 영화관을 계산해, 매진이나 주차 혼잡 시
            대안 극장을 즉시 비교할 수 있게 합니다.
          </li>
        </ol>

        <h3>정보 갱신 주기</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>변동성</th>
                <th>갱신 주기 및 방식</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>일간 박스오피스 순위</td>
                <td>매우 높음</td>
                <td>매일 갱신 (영화진흥위원회 KOBIS 전일 집계 기준)</td>
              </tr>
              <tr>
                <td>상영관별 관람료</td>
                <td>높음</td>
                <td>1~3개월 주기 점검 및 요금 개편 시 수시 갱신</td>
              </tr>
              <tr>
                <td>교통·주차 안내</td>
                <td>보통</td>
                <td>분기별(3개월) 정기 점검 및 이용자 제보 시 즉시 반영</td>
              </tr>
              <tr>
                <td>지점 목록·주소·폐점 여부</td>
                <td>낮음</td>
                <td>반기별 정기 점검 및 신규 개관·영업 종료 공지 시 즉시 반영</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>하지 않는 것</h2>
        <p>
          이 사이트는 예매, 결제, 좌석 선택 기능을 제공하지 않습니다.{' '}
          <strong>실시간 상영시간표도 직접 저장해 보여주지 않습니다.</strong> 영화관 상영시간표는
          현장 편성과 예매 상황에 따라 하루에도 수시로 변동되는 정보이므로, 비공식 사이트에 옮겨
          적으면 실제 시간표와 시차가 발생해 이용자에게 불편을 줄 위험이 큽니다. 대신 각 지점 페이지에서
          교통·주차·관람료를 먼저 확인한 뒤 한 번의 클릭으로 해당 지점의 공식 상영시간표 페이지로
          정확히 이동할 수 있도록 연결합니다.
        </p>
        <p>
          또한 이 사이트는 각 영화관 브랜드의 공식 서비스가 아니며, 어떤 브랜드와도 제휴·위탁·대행
          관계에 있지 않습니다. 자세한 내용은 <Link href="/disclaimer/">면책 고지</Link>를 참고해
          주세요.
        </p>

        <h2>정보의 한계와 정정 요청 안내</h2>
        <p>
          요금, 주차 정책, 입점 건물 정산 방식, 운영 시간은 각 영화관 및 건물 관리 주체의 사정에
          따라 예고 없이 바뀔 수 있습니다. 이 사이트의 정보는 데이터 확인 시점과 실제 현장 상황
          사이에 차이가 있을 수 있으므로 참고용으로 이용하시고, 결제나 방문 전에는 공식 채널에서
          최종 정보를 확인하시기 바랍니다.
        </p>
        <p>
          현장 안내와 다른 내용이나 오탈자를 발견하셨다면 <Link href="/contact/">정정 요청</Link>으로
          알려주세요. 공식 출처 대조 후 신속히 수정하여 반영합니다.
        </p>

        <h2>브랜드별 지점 보기</h2>
        <ul>
          {meta.brands.map((b) => (
            <li key={b.key}>
              <Link href={brandPath(b.segment)}>
                {b.name} 전국 {b.count}개 지점 안내 바로가기
              </Link>
            </li>
          ))}
        </ul>

        <h2>관련 정책</h2>
        <ul>
          <li>
            <Link href="/disclaimer/">면책 고지</Link> — 공식 서비스와의 관계, 정보 정확성에 대한
            책임 범위 안내
          </li>
          <li>
            <Link href="/affiliate-disclosure/">광고·제휴 고지</Link> — 광고 게재 원칙 및 외부 링크
            운영 투명성 안내
          </li>
          <li>
            <Link href="/privacy/">개인정보처리방침</Link> — 개인정보 수집 항목, 쿠키 및 맞춤형 광고
            설정 안내
          </li>
          <li>
            <Link href="/terms/">이용약관</Link> — 사이트 이용 조건 및 저작권 안내
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
