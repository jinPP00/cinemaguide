import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, operatingBranches, pricesOf, brandPath } from '@/lib/data';
import { guidePath, GUIDES } from '@/lib/paths';
import { baseFare, brandFareSummaries, fareInsight, MORNING_SLOT, won } from '@/lib/fares';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/jsonld';
import { dataGeneratedAt } from '@/lib/dates';

const PATH = guidePath(GUIDES.discounts);

export const discountGuideMetadata: Metadata = withOpenGraphUrl({
  title: '영화관 시간대별 할인·우대 요금·문화가 있는 날 예매 가이드',
  description:
    'CGV·롯데시네마·메가박스의 조조(모닝)·브런치·심야 시간대 요금 차이, 청소년·경로·장애인 우대 기준, 문화가 있는 날과 통신사·카드 할인 이용 시 확인 사항을 정리했습니다.',
  alternates: { canonical: PATH },
});

export default function DiscountGuidePage() {
  const summaries = brandFareSummaries();
  const insight = fareInsight();

  const brandConcessions = meta.brands.map((brand) => {
    const list = operatingBranches.filter((b) => b.brand === brand.key);
    let morningBranches = 0;
    let nightBranches = 0;
    const morningAdults: number[] = [];
    const weekdayYouths: number[] = [];
    const seniors: number[] = [];
    const disableds: number[] = [];

    for (const b of list) {
      const bf = baseFare(b);
      const rows = pricesOf(b.id);
      if (bf?.morningAdult != null) {
        morningBranches++;
        morningAdults.push(bf.morningAdult);
      }
      if (bf?.weekdayYouth != null) {
        weekdayYouths.push(bf.weekdayYouth);
      }
      if (rows.some((r) => r.timeSlot === '심야')) nightBranches++;
      for (const r of rows) {
        if (bf && r.label === bf.label && r.timeSlot === '일반' && r.dayType === '평일') {
          if (r.senior != null) seniors.push(r.senior);
          if (r.disabled != null) disableds.push(r.disabled);
        }
      }
    }

    const mode = (arr: number[]) => {
      if (arr.length === 0) return null;
      const m = new Map<number, number>();
      for (const v of arr) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    };

    const summary = summaries.find((s) => s.brand === brand.key);
    return {
      key: brand.key,
      name: brand.name,
      segment: brand.segment,
      morningLabel: MORNING_SLOT[brand.key],
      morningBranches,
      nightBranches,
      weekdayAdult: summary?.weekdayCommon ?? null,
      morningCommon: mode(morningAdults),
      youthCommon: mode(weekdayYouths),
      seniorCommon: mode(seniors),
      disabledCommon: mode(disableds),
    };
  });

  const crumbs = [
    { name: '홈', path: '/' },
    { name: '할인·예매 가이드', path: PATH },
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
          <li>할인·예매 가이드</li>
        </ol>
      </nav>

      <h1>영화관 시간대별 할인·우대 요금·예매 가이드</h1>
      <p className="guide-lead">
        CGV·롯데시네마·메가박스 전국 지점 요금표를 바탕으로 조조(모닝)·심야 시간대 요금 차이, 청소년·경로·장애인 우대 기준, 문화가 있는 날 및 통신사·제휴카드 할인 시 확인해야 할 규칙을 정리했습니다.
      </p>

      <ul className="guide-jump-list" aria-label="다른 영화 정보">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차 가이드</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화순위</Link></li>
      </ul>

      <section className="section" aria-labelledby="timeslot-compare">
        <h2 id="timeslot-compare">3사 조조·우대 대표 요금 비교 (평일 2D 일반관 기준)</h2>
        <p className="section-kicker">
          전국 지점 요금표에서 가장 많이 확인된 최빈값 기준이며, 조조 회차는 평일 일반 시간대보다 중앙값 기준 {won(insight.morningDiscount)} 낮게 책정되어 있습니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table data-table--fare">
            <thead>
              <tr>
                <th scope="col">브랜드</th>
                <th scope="col">평일 일반(성인)</th>
                <th scope="col">평일 조조·모닝(성인)</th>
                <th scope="col">평일 일반(청소년)</th>
                <th scope="col">심야 편성 지점</th>
              </tr>
            </thead>
            <tbody>
              {brandConcessions.map((b) => (
                <tr key={b.key}>
                  <th scope="row">
                    <Link className="guide-inline-link" href={brandPath(b.segment)}>{b.name}</Link>
                    <span className="subline">조조 표기: {b.morningLabel}</span>
                  </th>
                  <td>{b.weekdayAdult != null ? won(b.weekdayAdult) : '-'}</td>
                  <td>{b.morningCommon != null ? won(b.morningCommon) : '-'}<span className="subline">{b.morningBranches}곳 운영</span></td>
                  <td>{b.youthCommon != null ? won(b.youthCommon) : '-'}</td>
                  <td>{b.nightBranches > 0 ? `${b.nightBranches}곳` : '요금표 미표기'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="timeslot-rules">
        <h2 id="timeslot-rules">시간대별 관람료 구분 기준</h2>
        <div className="prose">
          <h3>1. 조조(모닝) 시간대 적용 기준</h3>
          <p>
            조조 할인은 첫 상영 회차부터 보통 <strong>오전 10시(지점·브랜드에 따라 오전 10시 30분~11시) 이전에 시작하는 상영 회차</strong>에 적용됩니다. CGV는 요금표에서 &lsquo;모닝&rsquo;이라는 명칭을 사용하며, 롯데시네마와 메가박스는 &lsquo;조조&rsquo;로 표기합니다. 별도의 할인 카드나 멤버십 포인트 차감 없이도 예매 단계에서 자동으로 할인된 기본 요금이 적용되는 것이 가장 큰 장점입니다.
          </p>

          <h3>2. 브런치·일반·프라임·심야 시간대 차이</h3>
          <p>
            CGV는 모닝 시간대 직후부터 오후 초반 회차까지 &lsquo;브런치&rsquo; 구간을 별도로 두는 지점이 많고, 롯데시네마와 메가박스는 조조 이후 시간대를 대부분 &lsquo;일반&rsquo;으로 묶어 운영합니다. 밤 10시~11시 이후 시작하는 &lsquo;심야&rsquo; 요금제는 전국 모든 지점이 아니라 일부 지점에서만 별도 요금 구간으로 운영되므로 방문할 지점 상세 페이지의 요금표에 심야 행이 있는지 먼저 확인해야 합니다.
          </p>

          <h3>3. 평일과 주말 요금 구분 (금요일 적용 기준 확인)</h3>
          <p>
            일반관 2D 성인 기준 주말 요금은 평일보다 보통 {won(insight.weekendPremium)} 높게 책정됩니다. 이때 영화관 요금표에서 &lsquo;주말&rsquo;은 토요일·일요일·법정공휴일을 의미하지만, 일부 브랜드나 특별관 요금 체계에서는 <strong>금요일을 주말 요금 구간에 포함</strong>하는 경우가 있으므로 금요일 관람 시에는 예매 화면의 적용 단가를 반드시 확인하시기 바랍니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="concession-guide">
        <h2 id="concession-guide">대상별 우대 할인 기준 및 지참 서류</h2>
        <p className="section-kicker">
          우대 요금으로 온라인 예매를 했더라도 상영관 입장 시 또는 매표소 발권 시 증빙 서류 확인을 요청받을 수 있습니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">구분</th>
                <th scope="col">적용 대상 기준</th>
                <th scope="col">현장 확인 증빙 서류</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">청소년 요금</th>
                <td>만 7세 이상 ~ 만 18세 이하 (초·중·고등학생 및 이에 준하는 연령의 청소년)</td>
                <td>학생증, 청소년증, 여권, 주민등록등본·초본 등 생년월일 확인 가능 서류</td>
              </tr>
              <tr>
                <th scope="row">경로 우대</th>
                <td>만 65세 이상 본인 (롯데시네마 지점 요금표 기준 일반 2D {brandConcessions.find((b) => b.key === 'lotte')?.seniorCommon != null ? won(brandConcessions.find((b) => b.key === 'lotte')!.seniorCommon!) : '우대가'} 등)</td>
                <td>주민등록증, 운전면허증, 경로우대증 등 본인 신분증</td>
              </tr>
              <tr>
                <th scope="row">장애인 우대</th>
                <td>장애인 복지카드 소지자 (장애 정도에 따라 동반 1인까지 동일 우대 요금 적용 여부 상이)</td>
                <td>장애인 복지카드 또는 모바일 장애인등록증</td>
              </tr>
              <tr>
                <th scope="row">국가유공자 우대</th>
                <td>국가유공자·독립유공자 및 유족증 소지자</td>
                <td>국가유공자증, 국가유공자 유족증 등 보훈처 발급 증서</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="culture-day">
        <h2 id="culture-day">문화가 있는 날 및 통신사·제휴 할인 활용법</h2>
        <div className="prose">
          <h3>1. 문화가 있는 날 (매월 마지막 수요일)</h3>
          <p>
            매월 마지막 주 수요일은 &lsquo;문화가 있는 날&rsquo;로 지정되어 전국 주요 영화관에서 <strong>오후 5시(17:00)부터 오후 9시(21:00) 사이에 상영을 시작하는 일반관 2D 영화</strong>를 할인된 단일 요금(통상 7,000원)으로 관람할 수 있습니다. 다만 IMAX, 4DX, 돌비 시네마, 샤롯데 등 특별관과 3D 상영 회차는 적용 대상에서 제외되며, 일부 프라이빗·프리미엄 전용 지점도 제외될 수 있습니다.
          </p>

          <h3>2. 통신사 멤버십(KT·SKT·LG U+)과 신용카드 할인 비교</h3>
          <p>
            통신사 멤버십 예매와 신용·체크카드 청구할인은 대부분 <strong>일반 시간대 성인 표준 요금</strong>을 기준으로 적용됩니다. 이미 할인된 조조(모닝) 회차나 문화가 있는 날 회차, 경로·장애인 우대 티켓에는 통신사 멤버십이나 카드사 할인이 중복 적용되지 않는 경우가 많습니다. 따라서 조조 시간대에 관람할 때는 멤버십 한도를 차감하지 않고 일반 예매를 하는 편이 유리하며, 주말 오후·저녁 일반 회차 관람 시에 멤버십 VIP 무료 예매나 동반인 할인, 카드 청구할인을 사용하는 것이 효과적입니다.
          </p>

          <h3>3. 온라인 예매 취소 및 환불 마감 시간</h3>
          <p>
            공식 웹사이트나 모바일 앱을 통한 온라인 예매 취소는 보통 <strong>상영 시작 시간 20분 전(일부 브랜드·지점은 15~30분 전)</strong>까지만 가능합니다. 이 시점이 지나면 온라인에서는 취소가 차단되며, 상영 시작 시각 이전까지 해당 영화관 현장 매표소를 직접 방문해야만 취소·환불 처리가 가능하므로 일정 변경 시 마감 시간을 반드시 유의하시기 바랍니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="discount-faq">
        <h2 id="discount-faq">할인·예매 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>조조 요금에도 통신사 멤버십이나 카드사 할인을 중복으로 받을 수 있나요?</dt>
            <dd>
              대부분의 통신사 멤버십과 제휴 카드는 &lsquo;조조·우대·문화가 있는 날 등 타 할인과 중복 불가&rsquo; 또는 &lsquo;최소 결제 금액(예: 티켓당 10,000원~12,000원 이상) 조건&rsquo;을 두고 있습니다. 조조 회차는 이미 할인된 요금이므로 일반 시간대 대비 실제 결제 금액을 비교한 뒤 유리한 쪽을 선택하세요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>부모님 대신 경로 우대 티켓을 앱에서 예매해 드려도 되나요?</dt>
            <dd>
              온라인·앱에서 경로 우대 권종으로 대리 예매하는 것은 가능하지만, 실제 관람하시는 분이 입장할 때 만 65세 이상임을 확인할 수 있는 신분증을 지참하셔야 합니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>만 48개월 미만 유아도 영화관 입장권을 구매해야 하나요?</dt>
            <dd>
              3사 공통으로 만 48개월 미만 아동이 증빙 서류(의료보험증, 가족관계증명서 등)를 지참하고 보호자 1인과 함께 한 좌석에서 관람하는 경우 무료 입장이 가능합니다. 단, 별도 좌석을 배정받으려면 청소년(어린이) 요금으로 티켓을 예매해야 합니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>지점마다 조조·일반 요금이 다른 이유는 무엇인가요?</dt>
            <dd>
              같은 브랜드라도 입점 지역 상권과 상영관 좌석 구성(일반석 vs 전 좌석 리클라이너·컴포트석)에 따라 지점별 요금표가 다르게 책정됩니다. 전국 지점별 상세 요금은 각 지점 안내 페이지와 관람료 비교 페이지에서 확인할 수 있습니다.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">
          요금 확인일 {meta.checkedAt} 기준 자료입니다. 통신사·카드사 제휴 조건과 우대 할인 정책은 각 사 사정에 따라 변경될 수 있으므로 결제 전 공식 예매 화면에서 최종 적용 금액을 확인해 주세요.
        </div>
      </section>
    </div>
  );
}
