import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { meta, brandPath } from '@/lib/data';
import { SITE } from '@/lib/site';
import { GUIDES, guidePath } from '@/lib/paths';

export const metadata: Metadata = withOpenGraphUrl({
  title: '사이트 소개',
  description:
    '영화관 지점안내가 어떤 정보를 어디서 모아 어떻게 정리하는지, 확인 기준과 갱신 주기.',
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
          {SITE.name}은 CGV·롯데시네마·메가박스 {meta.totalBranches}개 지점의 위치, 가는 길, 주차 조건,
          관람료, 특별관을 지점별로 모아 둔 개인 운영 사이트예요. 영화를 보러 가기 전에 확인하는 것들을
          세 브랜드 모두 같은 틀로 볼 수 있게 했어요.
        </p>

        <h2>만든 이유</h2>
        <p>
          상영시간표는 포털이나 앱에서 쉽게 찾을 수 있어요. 그런데 가기 직전에 궁금한 것들, 이를테면
          &ldquo;차를 가져가면 몇 시간 무료인지&rdquo;, &ldquo;주차 인증은 매표소에서 하는지 정산기에서
          하는지&rdquo;, &ldquo;근처 다른 브랜드 영화관과 조조 요금이 얼마나 다른지&rdquo;는 브랜드마다
          다른 화면에 흩어져 있어 여러 번 들어가 봐야 해요.
        </p>
        <p>
          주차와 교통 안내는 같은 브랜드 안에서도 지점마다 적는 방식이 달라서 필요한 조건만 골라 보기
          어려워요. 그래서 공식 안내문을 모은 뒤 주차는{' '}
          <strong>위치·규모·무료 시간·인증 방법·초과 요금·주의사항</strong>으로, 요금과 버스 노선은 같은
          형식의 표와 목록으로 다시 정리했어요.
        </p>

        <h2>볼 수 있는 것</h2>
        <ul>
          <li>
            <strong>지점별 안내</strong>: 주소와 지도, 상영관·좌석 수, 지하철 출구와 버스 번호, 주차장
            위치·무료 시간·초과 요금·인증 방법, 상영관·시간대별 요금(성인·청소년·경로·장애인), 근처 다른
            영화관
          </li>
          <li>
            <strong>
              <Link href={guidePath(GUIDES.fares)}>관람료 비교</Link>
            </strong>
            : 지점 요금표를 모아 평일·주말·조조 대표 요금과 지역별 차이를 비교
          </li>
          <li>
            <strong>
              <Link href={guidePath(GUIDES.screens)}>특별관</Link>
            </strong>
            : IMAX·돌비 시네마·4DX·SCREENX·수퍼플렉스·리클라이너가 있는 지점과 추가 요금
          </li>
          <li>
            <strong>
              <Link href={guidePath(GUIDES.parking)}>주차</Link>
            </strong>
            : 인증 방법 네 가지, 러닝타임과 무료 시간 계산, 백화점·쇼핑몰 영수증 합산
          </li>
          <li>
            <strong>
              <Link href={guidePath(GUIDES.discounts)}>할인·우대</Link>
            </strong>
            : 시간대별 요금, 문화가 있는 날, 청소년·경로·장애인 우대와 필요한 증빙
          </li>
          <li>
            <strong>
              <Link href={guidePath(GUIDES.boxoffice)}>영화 순위</Link>
            </strong>
            : 영화진흥위원회 통합전산망(KOBIS) 집계 순위와 관객 수, 매출 점유율
          </li>
        </ul>

        <h2>자료를 모으고 확인하는 방법</h2>
        <ul>
          <li>
            <strong>공식 출처만 써요</strong>: 각 브랜드 공식 홈페이지의 지점 페이지와 영화진흥위원회
            오픈 API처럼 확인할 수 있는 출처에서만 가져와요. 공식 사이트에 없는 내용은 짐작해서 채우지
            않아요.
          </li>
          <li>
            <strong>같은 틀로 다시 정리해요</strong>: 줄글로 된 주차 안내에서 위치, 주차 가능 대수, 무료
            시간, 정액 요금, 추가 요금 단위(10·15·30분), 인증 절차, 차종 제한을 항목별로 뽑아 표와 목록으로
            만들어요.
          </li>
          <li>
            <strong>빈 페이지는 검색에 내보내지 않아요</strong>: 관람료·교통·주차 중 하나라도 확인하지
            못한 지점은 검색엔진 색인에서 빼요(<code>noindex</code>).
          </li>
          <li>
            <strong>근처 영화관은 좌표로 계산해요</strong>: 모든 지점의 위도·경도로 브랜드와 상관없이
            가까운 영화관을 직선거리 순으로 보여 줘요.
          </li>
        </ul>

        <h3>갱신 주기</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>바뀌는 정도</th>
                <th>갱신</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>박스오피스 순위</td>
                <td>매우 자주</td>
                <td>매주 월요일, 영화진흥위원회 전날 집계 기준</td>
              </tr>
              <tr>
                <td>상영관별 관람료</td>
                <td>자주</td>
                <td>1~3개월마다 점검, 요금이 바뀌면 그때 반영</td>
              </tr>
              <tr>
                <td>교통·주차</td>
                <td>보통</td>
                <td>3개월마다 점검, 제보가 오면 바로 반영</td>
              </tr>
              <tr>
                <td>지점 목록·주소·폐점</td>
                <td>드묾</td>
                <td>6개월마다 점검, 개관·영업 종료 공지가 나오면 바로 반영</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>하지 않는 것</h2>
        <p>
          예매, 결제, 좌석 선택은 할 수 없어요.{' '}
          <strong>상영시간표도 이 사이트에 옮겨 적지 않아요.</strong> 시간표는 하루에도 여러 번 바뀌어서
          옮겨 적으면 실제와 어긋나기 쉬워요. 대신 지점 페이지에서 교통·주차·요금을 본 뒤 버튼 하나로 그
          지점의 공식 상영시간표로 넘어가게 했어요.
        </p>
        <p>
          이 사이트는 어느 영화관 브랜드의 공식 서비스도 아니며, 제휴나 위탁 관계도 없어요. 자세한 내용은{' '}
          <Link href="/disclaimer/">면책 고지</Link>에 있어요.
        </p>

        <h2>정보가 틀렸을 때</h2>
        <p>
          요금, 주차 정책, 건물 정산 방식, 운영 시간은 영화관과 건물 관리 쪽 사정으로 예고 없이 바뀔 수
          있어요. 확인한 날짜와 현장 상황이 다를 수 있으니 결제하거나 가기 전에는 공식 채널에서 다시
          확인하세요.
        </p>
        <p>
          현장과 다른 내용이나 오탈자를 보셨다면 <Link href="/contact/">정정 요청</Link>으로 알려 주세요. 공식
          출처와 대조한 뒤 고쳐요.
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
            <Link href="/disclaimer/">면책 고지</Link> — 공식 서비스와의 관계, 정보 정확성에 대한 책임 범위
          </li>
          <li>
            <Link href="/affiliate-disclosure/">광고·제휴 고지</Link> — 광고를 싣는 원칙과 외부 링크
          </li>
          <li>
            <Link href="/privacy/">개인정보처리방침</Link> — 수집하는 개인정보, 쿠키와 맞춤형 광고 설정
          </li>
          <li>
            <Link href="/terms/">이용약관</Link> — 이용 조건과 저작권
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
