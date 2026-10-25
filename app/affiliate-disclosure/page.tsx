import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = withOpenGraphUrl({
  title: '광고·제휴 고지',
  description:
    '영화관 지점안내의 광고 게재 여부와 제휴 관계, 편집 독립성 및 외부 링크 운영 원칙을 투명하게 밝힙니다.',
  alternates: { canonical: '/affiliate-disclosure/' },
});

export default function AffiliateDisclosurePage() {
  const hasCommercial = LEGAL.usesAds;

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>광고·제휴 고지</li>
        </ol>
      </nav>

      <h1>광고·제휴 고지</h1>

      <div className="prose">
        <p className="updated">최종 갱신 {LEGAL.updatedDate}</p>

        <h2>1. 현재 광고 및 제휴 운영 상태</h2>
        {hasCommercial ? (
          <p>
            {SITE.name}은 전국 영화관 지점 데이터베이스 구축, 정기 검수 및 웹 호스팅(CDN) 인프라 유지
            비용을 충당하여 모든 이용자에게 무료로 정보를 제공하기 위해{' '}
            <strong>Google AdSense(구글 애드센스)</strong> 디스플레이 광고 프로그램을 적용하고
            있습니다. 사이트 내에 표시되는 광고는 본문 정보와 명확히 구분되도록 배치됩니다.
          </p>
        ) : (
          <p>
            <strong>현재 사이트에는 유료 광고가 게재되어 있지 않으며, 어떤 영화관이나 업체와도 제휴
            관계를 맺고 있지 않습니다.</strong> 지점 정보를 정리해 공개하는 것 외에 사이트가 얻는
            상업적 수익은 없습니다.
          </p>
        )}
        <p>
          현재 본 사이트는 멀티플렉스 영화관 3사(CGV·롯데시네마·메가박스)를 비롯한 어떠한 기업과도
          개별적인 유료 협찬, 제휴 마케팅(Affiliate Marketing), 수수료 계약, 원고료 수령 관계를 맺고
          있지 않습니다. 앞으로 새로운 형태의 광고나 제휴 링크를 도입하게 될 경우, 적용 전에{' '}
          <strong>이 페이지를 먼저 갱신해</strong> 어떤 업체와 어떤 경제적 이해관계가 있는지
          투명하게 공개합니다.
        </p>

        <h2>2. 광고 배치 및 이용자 경험 보호 원칙</h2>
        <p>
          사이트에 광고가 게재되더라도 이용자가 영화관 정보를 탐색하는 본래의 목적을 해치지 않도록
          아래의 엄격한 원칙을 준수합니다.
        </p>
        <ul>
          <li>
            <strong>본문과 광고의 명확한 시각적 분리</strong>: 모든 광고 영역은 일반 안내 표나
            버튼으로 오인되지 않도록 구분된 영역에만 표시하며, 정보성 본문 텍스트나 표 디자인을
            모방한 기만적 광고 배치를 하지 않습니다.
          </li>
          <li>
            <strong>오클릭 유도 배치 금지</strong>: 이용자가 자주 누르는 &lsquo;상영시간표 확인&rsquo;
            버튼, &lsquo;지도에서 길찾기&rsquo; 버튼, 지역·지점 이동 칩 바로 옆에 광고를 밀착 배치하여
            실수로 광고를 클릭하게 만드는 구성을 엄격히 금지합니다.
          </li>
          <li>
            <strong>가독성 침해 광고 배제</strong>: 화면 전체를 가려 본문 열람을 막는 강제 전면 광고,
            닫기 버튼이 보이지 않는 플로팅 배너, 자동 재생 소리 광고, 의도치 않은 페이지 리디렉션
            광고를 사용하지 않습니다.
          </li>
          <li>
            <strong>경제적 이해관계 표시 의무</strong>: 향후 만약 특정 링크를 통해 수수료를 지급받는
            제휴 링크를 사용할 경우, 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」 및
            검색엔진 가이드라인에 따라 <code>rel=&quot;sponsored&quot;</code> 속성을 부여하고 링크
            인근에 수수료 수령 사실을 한글로 명확히 고지합니다.
          </li>
        </ul>

        <h2>3. 공식 사이트 바로가기 링크의 비제휴 성격</h2>
        <p>
          각 지점 상세 페이지에서 제공하는 &lsquo;상영시간표 확인&rsquo;, &lsquo;공식 페이지&rsquo;,
          &lsquo;지도에서 길찾기&rsquo; 버튼 및 링크는 <strong>어떠한 수수료나 대가도 발생하지 않는
          순수 안내용 외부 링크</strong>입니다. 이용자가 실시간 상영시간표와 잔여 좌석을 가장 정확한
          공식 채널에서 바로 확인하고 예매할 수 있도록 연결하는 기능이며, 이용자가 해당 링크를 통해
          티켓을 예매하거나 결제하더라도 본 사이트에는 일체의 수익이 발생하지 않습니다.
        </p>

        <h2>4. 편집 독립성과 데이터 비교 기준</h2>
        <p>
          {SITE.name}의 모든 지점 안내와 비교 가이드는 광고 여부나 외부 이해관계로부터 완전히 독립되어
          작성됩니다.
        </p>
        <ol>
          <li>
            <strong>객관적 정렬 기준</strong>: 브랜드별·지역별 지점 목록과 주변 대안 영화관 비교 표는
            오직 가나다순, 시도 행정구역 순서, 또는 위도·경도 좌표에 기반한 실제 직선거리(km) 순서로만
            정렬됩니다. 금전적 대가를 받고 특정 브랜드나 지점을 상단에 우선 노출하지 않습니다.
          </li>
          <li>
            <strong>동일한 잣대의 사실 기술</strong>: 관람료 비교, 특별관 보유 현황, 주차 무료 시간
            및 초과 요금 안내는 3사 공식 웹사이트에 공개된 수치를 동일한 규칙으로 집계해 서술하며,
            특정 영화관 브랜드를 홍보하거나 비방하기 위해 정보를 가감하지 않습니다.
          </li>
        </ol>

        <h2>5. 관련 정책 및 문의 안내</h2>
        <p>
          광고 송출 과정에서 사용되는 쿠키(Cookie) 및 맞춤형 광고 설정 해제 방법에 대해서는{' '}
          <Link href="/privacy/">개인정보처리방침</Link> 제4조에서 자세히 안내하고 있습니다. 기타
          사이트 이용 조건과 책임 범위는 <Link href="/terms/">이용약관</Link> 및{' '}
          <Link href="/disclaimer/">면책 고지</Link>를 참고해 주시고, 광고나 제휴에 관한 문의 사항은{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> 또는{' '}
          <Link href="/contact/">문의·정정 요청</Link> 페이지로 보내주시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
