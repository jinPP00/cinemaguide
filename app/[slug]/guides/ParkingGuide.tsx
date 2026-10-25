import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, operatingBranches, branchPath, brandPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { parkingSummary, parkingGroups } from '@/lib/parking';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';

const PATH = guidePath(GUIDES.parking);

export const parkingGuideMetadata: Metadata = withOpenGraphUrl({
  title: '전국 영화관 주차 요금·무료 시간·사전 정산 가이드',
  description:
    'CGV·롯데시네마·메가박스 전국 지점의 주차 무료 시간, 기본·초과 요금, 사전 정산 방법, 백화점·복합쇼핑몰 입점 영화관 주차 유의사항을 데이터로 정리했습니다.',
  alternates: { canonical: PATH },
});

export default function ParkingGuidePage() {
  const confirmedBranches = operatingBranches.filter((b) => parkingGroups(b).length > 0);
  const brandStats = meta.brands.map((brand) => {
    const list = confirmedBranches.filter((b) => b.brand === brand.key);
    let free3h = 0;
    let freeUncond = 0;
    let paidDiscount = 0;
    let combined = 0;
    for (const b of list) {
      const s = parkingSummary(b);
      const groups = parkingGroups(b);
      if (s?.free === '관람 시') freeUncond++;
      else if (s?.free) free3h++;
      if (s?.flat) paidDiscount++;
      if (groups.some((g) => g.label === '다른 매장 합산')) combined++;
    }
    return {
      brandName: brand.name,
      segment: brand.segment,
      total: list.length,
      freeTimed: free3h,
      freeUncond,
      paidDiscount,
      combined,
    };
  });

  const combinedExamples = confirmedBranches
    .filter((b) => parkingGroups(b).some((g) => g.label === '다른 매장 합산'))
    .slice(0, 12);

  const crumbs = [
    { name: '홈', path: '/' },
    { name: '주차 가이드', path: PATH },
  ];

  return (
    <div className="wrap page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd(crumbs),
          webPageJsonLd(PATH, dataGeneratedAt.toISOString()),
        )}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li>주차 가이드</li>
        </ol>
      </nav>

      <h1>전국 영화관 주차 요금·무료 시간·정산 가이드</h1>
      <p className="guide-lead">
        CGV·롯데시네마·메가박스 전국 {confirmedBranches.length}개 운영 지점의 공식 주차 안내를 분석해 무료 주차 시간, 초과 요금 계산 기준, 사전 정산 방식, 복합쇼핑몰·백화점 입점 지점 이용 요령을 정리했습니다.
      </p>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·예매 가이드</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화순위</Link></li>
      </ul>

      <section className="section" aria-labelledby="parking-overview">
        <h2 id="parking-overview">브랜드별 주차 운영 현황</h2>
        <p className="section-kicker">
          전국 3사 영화관은 입점 건물 형태(단독 건물·복합쇼핑몰·백화점·대형마트)에 따라 무료 주차 시간과 정산 규칙이 다르게 운영됩니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">주차 안내 확인</th>
                <th scope="col">시간제 무료 주차</th>
                <th scope="col">기본 유료 할인</th>
                <th scope="col">타 매장 합산 가능</th>
              </tr>
            </thead>
            <tbody>
              {brandStats.map((row) => (
                <tr key={row.brandName}>
                  <th scope="row">
                    <Link className="guide-inline-link" href={brandPath(row.segment)}>{row.brandName}</Link>
                  </th>
                  <td>{row.total}곳</td>
                  <td>{row.freeTimed}곳<span className="subline">제한 없음 {row.freeUncond}곳 별도</span></td>
                  <td>{row.paidDiscount}곳</td>
                  <td>{row.combined}곳</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className=" prose" style={{ marginTop: 16 }}>
          <p>
            대부분의 멀티플렉스 지점은 당일 영화 관람 티켓을 인증하면 <strong>입차 시점 기준 3시간에서 3시간 30분까지 무료 주차</strong>를 제공합니다. 다만 서울 도심이나 역세권 상업 빌딩에 입점한 일부 지점은 영화 관람객에게도 기본 주차 요금(예: 3시간 1,500원~3,500원)을 부과하며, 반대로 지방 단독 건물이나 대형 아울렛·스타필드 입점 지점은 별도 시간 제한 없이 무료로 개방하는 곳도 있습니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="parking-verify">
        <h2 id="parking-verify">주차 인증·사전 정산 방식 4가지 비교</h2>
        <p className="section-kicker">
          출차 게이트에서는 차량 번호 자동 인식(LPR) 시스템을 사용하는 지점이 많아 상영관 퇴장 전 사전 등록 여부를 반드시 확인해야 합니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">정산 방식</th>
                <th scope="col">등록 위치 및 방법</th>
                <th scope="col">이용 시 주의할 점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">로비 키오스크·티켓판매기</th>
                <td>매표소 인근 전용 태블릿 또는 티켓발권기에서 차량 번호 4자리 입력 후 지류·모바일 티켓 바코드 스캔</td>
                <td>상영 종료 직후에는 대기 줄이 길어지므로 영화 입장 전 미리 등록하는 것이 편리합니다.</td>
              </tr>
              <tr>
                <th scope="row">모바일 앱 자동·셀프 인증</th>
                <td>공식 앱 예매 내역(모바일 티켓) 화면의 &lsquo;주차 인증&rsquo; 메뉴에 차량 번호를 직접 입력</td>
                <td>입차 후 차량 번호가 주차 관제 서버에 인식된 뒤(보통 입차 10~15분 후)부터 등록할 수 있습니다.</td>
              </tr>
              <tr>
                <th scope="row">주차장 무인정산기</th>
                <td>엘리베이터 홀 또는 주차장 층에 설치된 무인정산기에서 차량 번호 조회 후 티켓 바코드 인식</td>
                <td>무료 주차 시간을 초과한 경우 그 자리에서 신용·체크카드로 초과 요금까지 바로 결제해야 출차 게이트가 열립니다.</td>
              </tr>
              <tr>
                <th scope="row">매표소·현장 직원 확인</th>
                <td>매표소·매점 직원에게 차량 번호를 전달하거나 출차 정산소에서 당일 영화 티켓 제시</td>
                <td>기계식 주차타워나 발렛 주차 운영 지점은 주차권 도장 날인 또는 입차증 교부가 필요한지 확인해야 합니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="parking-tips">
        <h2 id="parking-tips">방문 전 꼭 확인해야 할 주차 유의사항 5가지</h2>
        <div className="prose">
          <h3>1. 러닝타임이 긴 영화와 무료 주차 시간 계산</h3>
          <p>
            주차 시간은 영화 시작 시각이 아니라 <strong>주차장 게이트 입차 시각부터 출차 시각까지</strong>로 계산됩니다. 입장 전 대기 시간(약 20분)과 상영 전 광고(약 10~15분), 퇴장 및 엘리베이터 이동 시간(약 15~20분)을 합치면 실제 체류 시간은 영화 러닝타임보다 최소 40~50분 더 길어집니다. 러닝타임이 150분(2시간 30분)을 넘는 작품을 3시간 무료 주차 지점에서 관람할 때는 초과 요금(보통 10분당 500원~1,000원) 부과 여부를 미리 확인해 두는 것이 안전합니다.
          </p>

          <h3>2. 백화점·쇼핑몰·대형마트 입점 지점의 타 매장 영수증 합산</h3>
          <p>
            롯데백화점, 신세계백화점, 현대백화점, 롯데몰, 스타필드, 홈플러스, 롯데마트 등 복합 상업시설에 입점한 영화관은 영화 관람 무료 시간(보통 3시간)에 더해 같은 건물 내 식당가·카페·마트 구매 금액별 무료 주차 시간을 추가로 합산(보통 최대 4~5시간)해 주는 곳이 많습니다. 단, 지점에 따라 합산 등록을 영화관 키오스크가 아닌 주차장 무인정산기에서 한 번에 처리해야 하는 경우가 있으므로 출차 전 합산 한도를 확인하세요.
          </p>

          <h3>3. 심야 영화 관람 시 매장 폐점 후 전용 출입구·주차 구역</h3>
          <p>
            백화점이나 대형마트에 입점한 지점은 밤 10시~11시 이후 본 매장 영업이 종료되면 일반 에스컬레이터와 일부 주차 층 출입문이 잠깁니다. 심야 영화를 관람할 때는 지정된 야간 전용 주차 층(예: 지상 1층 또는 영화관 직통 엘리베이터 인근 구역)에 주차해야 영화가 끝난 뒤 차량으로 이동할 수 있습니다.
          </p>

          <h3>4. 당일 1일 1회 제한 및 출차 후 재입차 불가 규정</h3>
          <p>
            거의 모든 지점에서 영화 관람 주차 할인은 <strong>차량 1대당 하루 1회</strong>만 적용됩니다. 무료 주차 시간이 남아 있더라도 일단 출차 게이트를 통과한 뒤 다시 입차하면 기존 할인이 소멸되어 일반 요금이 부과됩니다. 같은 날 영화 두 편을 연달아 관람하는 경우에는 매표소나 안내 데스크에 두 편의 티켓을 함께 제시해 추가 시간 등록이 가능한지 문의해야 합니다.
          </p>

          <h3>5. 주말·공휴일 만차 및 제휴·공영주차장 구분</h3>
          <p>
            주말 오후 시간대에는 건물 내 주차장이 만차되어 입차에만 20~30분 이상 소요되는 지점이 많습니다. 건물 만차로 인해 제휴되지 않은 인근 유료 민영·공영주차장에 주차하면 영화 티켓이 있더라도 주차비 지원을 받을 수 없으므로, 각 지점 상세 페이지에서 지정된 본관·별관·제휴 주차장 위치를 먼저 확인하시기 바랍니다.
          </p>
        </div>
      </section>

      {combinedExamples.length > 0 && (
        <section className="section" aria-labelledby="combined-branches">
          <h2 id="combined-branches">타 매장 합산 할인이 확인된 주요 지점</h2>
          <p className="section-kicker">백화점·마트·쇼핑몰 이용분과 영화 관람 주차 시간을 합산할 수 있는 대표 지점입니다.</p>
          <ul className="chip-list" style={{ marginTop: 14 }}>
            {combinedExamples.map((b) => (
              <li key={b.id}>
                <Link className="chip" href={branchPath(b)}>
                  {b.name} {b.brandName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section" aria-labelledby="parking-faq">
        <h2 id="parking-faq">영화관 주차 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>모바일 티켓으로 예매했는데 주차 등록은 어떻게 하나요?</dt>
            <dd>
              상영관 로비에 비치된 주차 등록 키오스크에 차량 번호 4자리를 입력한 뒤 모바일 티켓의 바코드(또는 예매번호)를 스캔하면 등록됩니다. 일부 지점은 각 영화관 공식 앱의 모바일 티켓 화면 안에서 차량 번호를 직접 입력해 정산할 수 있습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>영화를 두 편 연속으로 보면 무료 주차 시간도 두 배로 늘어나나요?</dt>
            <dd>
              무인 키오스크에서는 차량당 1회(보통 3시간)만 등록되는 경우가 많습니다. 두 편 이상 연속 관람 시에는 두 티켓을 지참해 상영관 매표소나 현장 직원에게 합산 정산 가능 여부와 최대 인정 시간을 확인해야 합니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>주차 요금을 현금으로 결제할 수 있나요?</dt>
            <dd>
              최근 대다수 영화관 건물은 출차 게이트 무인화로 인해 신용·체크카드 및 삼성페이 등 카드 결제만 가능하며 현금 결제를 지원하지 않습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>사전 정산을 깜빡하고 출차 게이트까지 나왔을 때는 어떻게 하나요?</dt>
            <dd>
              출차 게이트 정산기에 티켓 바코드 스캐너가 있는 경우 그 자리에서 티켓을 인식시킬 수 있으며, 스캐너가 없다면 정산기 호출 버튼을 눌러 주차 관제실에 당일 영화 관람 티켓 번호를 확인받아야 합니다. 미등록 상태로 일반 요금을 결제한 뒤에는 환불이 불가능한 주차장이 많으므로 주의하세요.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">
          지점별 상세 주차 위치·무료 시간·초과 요금은 각 지점 안내 페이지에서 확인할 수 있습니다. 입점 건물의 사정으로 주차 정책이 예고 없이 변경될 수 있으므로 방문 전 공식 채널 안내를 함께 확인해 주세요.
        </div>
      </section>
    </div>
  );
}
