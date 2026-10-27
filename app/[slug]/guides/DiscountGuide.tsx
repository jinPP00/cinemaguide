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
  title: '영화관 조조·우대 요금과 문화가 있는 날',
  description:
    'CGV·롯데시네마·메가박스의 조조(모닝)·브런치·심야 요금 차이, 청소년·경로·장애인 우대 기준, 문화가 있는 날, 통신사·카드 할인을 쓸 때 확인할 점.',
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
    { name: '할인·우대', path: PATH },
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
          <li>할인·우대</li>
        </ol>
      </nav>

      <h1>영화관 조조·우대 요금과 할인</h1>
      <p className="guide-lead">
        지점 요금표를 바탕으로 조조(모닝)·심야 요금 차이, 청소년·경로·장애인 우대 기준을 적었습니다. 문화가 있는 날과
        통신사·카드 할인을 쓸 때 걸리는 조건도 함께 정리했습니다.
      </p>

      <ul className="guide-jump-list" aria-label="다른 안내">
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.parking)}>주차</Link></li>
        <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화 순위</Link></li>
      </ul>

      <section className="section" aria-labelledby="timeslot-compare">
        <h2 id="timeslot-compare">브랜드별 조조·청소년 요금</h2>
        <p className="section-kicker">
          평일 2D 일반관, 지점 요금표에서 가장 흔한 금액입니다. 조조는 평일 일반 시간대보다 중앙값으로 {won(insight.morningDiscount)} 낮습니다.
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
                  <td className="num">{b.weekdayAdult != null ? won(b.weekdayAdult) : '-'}</td>
                  <td><span className="num">{b.morningCommon != null ? won(b.morningCommon) : '-'}</span><span className="subline">{b.morningBranches}곳</span></td>
                  <td className="num">{b.youthCommon != null ? won(b.youthCommon) : '-'}</td>
                  <td className="num">{b.nightBranches > 0 ? `${b.nightBranches}곳` : '요금표에 없음'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="timeslot-rules">
        <h2 id="timeslot-rules">시간대 구분</h2>
        <div className="prose">
          <h3>조조(모닝)</h3>
          <p>
            첫 회차부터 보통 <strong>오전 10시 전에 시작하는 회차</strong>입니다(지점·브랜드에 따라 10시 30분~11시). CGV는 요금표에 &lsquo;모닝&rsquo;, 롯데시네마와 메가박스는 &lsquo;조조&rsquo;라고 적습니다. 카드나 멤버십 없이도 예매할 때 낮은 요금이 그대로 적용됩니다.
          </p>

          <h3>브런치·일반·심야</h3>
          <p>
            CGV는 모닝 다음부터 이른 오후까지 &lsquo;브런치&rsquo; 구간을 따로 두는 지점이 많고, 롯데시네마와 메가박스는 조조 다음을 대부분 &lsquo;일반&rsquo;으로 묶습니다. 밤 10~11시 이후의 &lsquo;심야&rsquo; 요금은 일부 지점에만 있으니, 갈 지점 요금표에 심야 줄이 있는지 먼저 보세요.
          </p>

          <h3>평일과 주말, 그리고 금요일</h3>
          <p>
            일반관 2D 성인 주말 요금은 평일보다 보통 {won(insight.weekendPremium)} 높습니다. 요금표의 &lsquo;주말&rsquo;은 토·일요일과 공휴일이지만, 일부 브랜드나 특별관은 <strong>금요일도 주말 요금</strong>을 받습니다. 금요일에 본다면 예매 화면에 찍힌 금액을 확인하세요.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="concession-guide">
        <h2 id="concession-guide">우대 요금 대상과 증빙</h2>
        <p className="section-kicker">
          우대 요금으로 온라인 예매를 했어도 입장하거나 발권할 때 증빙을 보여 달라고 할 수 있습니다.
        </p>
        <div className="data-table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">구분</th>
                <th scope="col">대상</th>
                <th scope="col">보여 줄 것</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">청소년</th>
                <td>만 7세~만 18세 (초·중·고등학생 나이)</td>
                <td>학생증, 청소년증, 여권, 주민등록등·초본처럼 생년월일이 나온 서류</td>
              </tr>
              <tr>
                <th scope="row">경로</th>
                <td>만 65세 이상 본인 (롯데시네마 요금표 기준 일반 2D {brandConcessions.find((b) => b.key === 'lotte')?.seniorCommon != null ? won(brandConcessions.find((b) => b.key === 'lotte')!.seniorCommon!) : '우대가'} 등)</td>
                <td>주민등록증, 운전면허증, 경로우대증 같은 신분증</td>
              </tr>
              <tr>
                <th scope="row">장애인</th>
                <td>장애인 복지카드가 있는 사람 (동반 1인까지 같은 요금인지는 장애 정도에 따라 다름)</td>
                <td>장애인 복지카드 또는 모바일 장애인등록증</td>
              </tr>
              <tr>
                <th scope="row">국가유공자</th>
                <td>국가유공자·독립유공자와 유족증이 있는 사람</td>
                <td>국가유공자증, 유족증 같은 보훈부 발급 증서</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="culture-day">
        <h2 id="culture-day">문화가 있는 날과 통신사·카드 할인</h2>
        <div className="prose">
          <h3>문화가 있는 날 (매달 마지막 수요일)</h3>
          <p>
            매달 마지막 수요일에는 <strong>오후 5시부터 9시 사이에 시작하는 일반관 2D 회차</strong>를 한 가지 요금(보통 7,000원)으로 볼 수 있습니다. IMAX, 4DX, 돌비 시네마, 샤롯데 같은 특별관과 3D 회차는 빠지고, 일부 프리미엄 전용 지점도 빠질 수 있습니다.
          </p>

          <h3>통신사 멤버십(KT·SKT·LG U+)과 카드 할인</h3>
          <p>
            통신사 멤버십 예매와 카드 청구할인은 대부분 <strong>일반 시간대 성인 요금</strong>에만 적용됩니다. 조조, 문화가 있는 날, 경로·장애인 우대처럼 이미 낮아진 요금에는 겹쳐 쓰지 못하는 경우가 많습니다. 그래서 조조는 멤버십을 아끼고 그냥 예매하고, 멤버십 무료 예매나 동반인 할인, 카드 할인은 주말 오후·저녁 일반 회차에 쓰는 사람이 많습니다.
          </p>

          <h3>예매 취소 마감</h3>
          <p>
            웹이나 앱 예매는 보통 <strong>상영 20분 전(브랜드·지점에 따라 15~30분 전)</strong>까지만 취소됩니다. 그 뒤에는 온라인 취소가 막히고, 상영 시작 전에 현장 매표소에 가야만 취소·환불할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="discount-faq">
        <h2 id="discount-faq">할인·우대 자주 묻는 질문</h2>
        <dl className="faq-list">
          <div className="faq-item">
            <dt>조조 요금에 통신사나 카드 할인을 겹쳐 받을 수 있나요?</dt>
            <dd>
              대부분의 통신사 멤버십과 제휴 카드는 &lsquo;조조·우대·문화가 있는 날 등 다른 할인과 중복 불가&rsquo;이거나 &lsquo;티켓당 10,000~12,000원 이상 결제&rsquo; 같은 조건이 있습니다. 조조는 이미 요금이 낮으니 일반 시간대에 할인을 받은 금액과 비교해 보고 고르세요.
            </dd>
          </div>
          <div className="faq-item">
            <dt>부모님 경로 우대 티켓을 제가 앱으로 예매해도 되나요?</dt>
            <dd>
              됩니다. 다만 실제로 보시는 분이 입장할 때 만 65세 이상임을 확인할 신분증을 가져가셔야 합니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>만 48개월이 안 된 아이도 표를 사야 하나요?</dt>
            <dd>
              세 브랜드 모두 만 48개월 미만 아이가 증빙(건강보험증, 가족관계증명서 등)을 가지고 보호자와 한 좌석에 앉으면 무료입니다. 좌석을 따로 쓰려면 청소년(어린이) 요금으로 예매해야 합니다.
            </dd>
          </div>
          <div className="faq-item">
            <dt>지점마다 조조·일반 요금이 다른 이유는 뭔가요?</dt>
            <dd>
              같은 브랜드라도 지역과 상영관 좌석 구성(일반석인지 전 좌석 리클라이너·컴포트석인지)에 따라 지점 요금표가 다릅니다. 지점별 요금은 각 지점 페이지와 관람료 비교 페이지에 있습니다.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <div className="note">
          요금 확인일 {meta.checkedAt} 기준입니다. 통신사·카드 제휴 조건과 우대 정책은 각 회사 사정에 따라 바뀔 수 있으니 결제 전에 공식 예매 화면의 금액을 확인하세요.
        </div>
      </section>
    </div>
  );
}
