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
  title: '영화관 주차 요금·무료 시간·정산 방법',
  description:
    'CGV·롯데시네마·메가박스 지점의 주차 무료 시간, 기본·초과 요금, 정산 방법, 백화점·쇼핑몰 안 영화관의 주차 주의점.',
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
    { name: '주차', path: PATH },
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
          <li>주차</li>
        </ol>
      </nav>

      <h1>영화관 주차 요금·무료 시간·정산 방법</h1>
      <p className="guide-lead">
        주차 안내를 확인한 {confirmedBranches.length}개 지점의 공식 안내를 모았습니다. 무료 시간, 초과 요금, 정산 방법, 백화점·쇼핑몰 안 지점에서 주의할 점을 차례로 적었습니다.
      </p>

      <ul className="guide-jump-list" aria-label="다른 안내">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.discounts)}>할인·우대</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화 순위</Link></li>
      </ul>

      <section className="section" aria-labelledby="parking-overview">
        <h2 id="parking-overview">브랜드별 주차 조건</h2>
        <p className="section-kicker">
          무료 시간과 정산 규칙은 영화관이 들어선 건물(단독 건물·쇼핑몰·백화점·대형마트)에 따라 달라집니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">주차 안내 확인</th>
                <th scope="col">시간제 무료</th>
                <th scope="col">유료(할인)</th>
                <th scope="col">다른 매장 합산</th>
              </tr>
            </thead>
            <tbody>
              {brandStats.map((row) => (
                <tr key={row.brandName}>
                  <th scope="row">
                    <Link className="guide-inline-link" href={brandPath(row.segment)}>{row.brandName}</Link>
                  </th>
                  <td className="num">{row.total}곳</td>
                  <td><span className="num">{row.freeTimed}곳</span><span className="subline">시간 제한 없는 곳 {row.freeUncond}곳 별도</span></td>
                  <td className="num">{row.paidDiscount}곳</td>
                  <td className="num">{row.combined}곳</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="guide-copy">
          대부분의 지점은 그날 관람한 티켓을 인증하면 <strong>입차부터 3시간~3시간 30분</strong>까지 무료입니다. 서울
          도심이나 역 앞 상가 건물에 있는 일부 지점은 관람객에게도 요금(예: 3시간 1,500~3,500원)을 받고, 반대로
          지방 단독 건물이나 대형 아울렛·스타필드 안 지점은 시간 제한 없이 무료인 곳도 있습니다.
        </p>
      </section>

      <section className="section" aria-labelledby="parking-verify">
        <h2 id="parking-verify">주차 인증 방법</h2>
        <p className="section-kicker">
          출구에서 차량 번호를 자동으로 읽는 주차장이 많아서, 나가기 전에 미리 등록해 두어야 합니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">방법</th>
                <th scope="col">어디서, 어떻게</th>
                <th scope="col">주의할 점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">로비 키오스크·티켓판매기</th>
                <td>매표소 근처 태블릿이나 발권기에서 차량 번호 4자리를 넣고 종이·모바일 티켓 바코드를 찍습니다.</td>
                <td>영화가 끝난 직후에는 줄이 길어서 입장 전에 해 두는 게 편합니다.</td>
              </tr>
              <tr>
                <th scope="row">모바일 앱</th>
                <td>공식 앱의 모바일 티켓 화면에서 &lsquo;주차 인증&rsquo;을 눌러 차량 번호를 넣습니다.</td>
                <td>입차 기록이 주차장 시스템에 올라간 뒤(보통 10~15분 후)부터 등록됩니다.</td>
              </tr>
              <tr>
                <th scope="row">주차장 무인정산기</th>
                <td>엘리베이터 앞이나 주차장 층의 정산기에서 차량 번호를 찾고 티켓 바코드를 찍습니다.</td>
                <td>무료 시간을 넘겼다면 그 자리에서 카드로 초과 요금을 내야 출구 차단기가 열립니다.</td>
              </tr>
              <tr>
                <th scope="row">매표소·직원</th>
                <td>매표소·매점 직원에게 차량 번호를 말하거나, 출구 정산소에서 그날 티켓을 보여 줍니다.</td>
                <td>기계식 주차타워나 발레 주차를 쓰는 지점은 주차권에 도장을 받거나 입차증이 필요한지 확인하세요.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="parking-tips">
        <h2 id="parking-tips">가기 전에 알아 둘 것</h2>
        <div className="prose">
          <h3>러닝타임이 긴 영화</h3>
          <p>
            주차 시간은 상영 시작이 아니라 <strong>입차부터 출차까지</strong>입니다. 입장 대기(20분 안팎), 광고(10~15분), 퇴장과 엘리베이터 이동(15~20분)을 더하면 실제로는 상영 시간보다 40~50분 더 머뭅니다. 150분이 넘는 영화를 3시간 무료 지점에서 본다면 초과 요금(보통 10분에 500~1,000원)을 미리 확인하세요.
          </p>

          <h3>백화점·쇼핑몰 영수증 합산</h3>
          <p>
            롯데·신세계·현대백화점, 롯데몰, 스타필드, 홈플러스, 롯데마트처럼 큰 상업시설 안의 영화관은 관람 무료 시간(보통 3시간)에 같은 건물 식당·카페·마트 구매 금액만큼 시간을 더해 주는 곳이 많습니다(보통 최대 4~5시간). 합산을 영화관 키오스크가 아니라 주차장 정산기에서 한 번에 해야 하는 지점도 있으니 나가기 전에 한도를 확인하세요.
          </p>

          <h3>심야 상영 뒤 출입구</h3>
          <p>
            백화점이나 대형마트 안 지점은 밤 10~11시에 매장이 문을 닫으면 에스컬레이터와 일부 주차 층 출입문이 잠깁니다. 심야 회차를 본다면 영화관 직통 엘리베이터 근처처럼 정해진 야간 주차 구역에 세워야 끝나고 차로 갈 수 있습니다.
          </p>

          <h3>하루 한 번, 나갔다 들어오면 다시 계산</h3>
          <p>
            관람 주차 할인은 거의 모든 지점에서 <strong>차량 한 대당 하루 한 번</strong>입니다. 무료 시간이 남아 있어도 한 번 나갔다 다시 들어오면 일반 요금이 붙습니다. 같은 날 두 편을 이어서 본다면 매표소에 티켓 두 장을 보여 주고 시간을 더 등록할 수 있는지 물어보세요.
          </p>

          <h3>주말 만차와 제휴 주차장</h3>
          <p>
            주말 오후에는 건물 주차장이 차서 들어가는 데만 20~30분 걸리는 지점이 많습니다. 제휴하지 않은 근처 유료·공영 주차장에 세우면 티켓이 있어도 지원을 받을 수 없으니, 지점 페이지에서 본관·별관·제휴 주차장 위치를 먼저 확인하세요.
          </p>
        </div>
      </section>

      {combinedExamples.length > 0 && (
        <section className="section" aria-labelledby="combined-branches">
          <h2 id="combined-branches">다른 매장 영수증을 합산해 주는 지점</h2>
          <p className="section-kicker">백화점·마트·쇼핑몰에서 쓴 금액만큼 관람 주차 시간을 늘려 주는 지점의 일부입니다.</p>
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
        <h2 id="parking-faq">주차 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>모바일 티켓으로 예매했는데 주차 등록은 어떻게 하나요?</dt>
            <dd>
              로비의 주차 등록 키오스크에 차량 번호 4자리를 넣고 모바일 티켓 바코드(또는 예매번호)를 찍으면 됩니다. 일부 지점은 공식 앱의 모바일 티켓 화면에서 차량 번호를 바로 넣을 수 있습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>두 편을 이어서 보면 무료 시간도 두 배가 되나요?</dt>
            <dd>
              키오스크에서는 차량당 한 번(보통 3시간)만 등록되는 경우가 많습니다. 티켓 두 장을 들고 매표소나 직원에게 합산할 수 있는지, 최대 몇 시간까지 되는지 물어보세요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>주차 요금을 현금으로 결제할 수 있나요?</dt>
            <dd>
              요즘은 출구가 무인으로 바뀐 곳이 많아 대부분 카드나 삼성페이 같은 간편결제만 받고 현금은 받지 않습니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>등록을 잊고 출구까지 왔다면 어떻게 하나요?</dt>
            <dd>
              출구 정산기에 바코드 스캐너가 있으면 거기서 티켓을 찍으면 됩니다. 없으면 호출 버튼을 눌러 관리실에 그날 티켓 번호를 확인받으세요. 등록하지 않고 일반 요금을 낸 뒤에는 환불해 주지 않는 주차장이 많습니다.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">
          지점별 주차 위치, 무료 시간, 초과 요금은 각 지점 페이지에 있습니다. 건물 사정으로 주차 정책이 예고 없이 바뀔 수 있으니 가기 전에 공식 안내도 함께 확인하세요.
        </div>
      </section>
    </div>
  );
}
