import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: '광고·제휴 고지',
  description:
    '영화관 지점안내의 광고 게재 여부와 제휴 관계, 그것이 콘텐츠에 미치는 영향을 투명하게 밝힙니다.',
  alternates: { canonical: '/affiliate-disclosure/' },
};

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

        <h2>현재 상태</h2>
        {hasCommercial ? (
          <p>
            사이트는 운영 비용을 충당하기 위해 광고를 게재하고 있습니다. 광고는 콘텐츠와 명확히
            구분되도록 표시합니다.
          </p>
        ) : (
          <p>
            <strong>현재 사이트에는 광고가 게재되어 있지 않으며, 어떤 영화관이나 업체와도 제휴
            관계를 맺고 있지 않습니다.</strong> 지점 정보를 정리해 공개하는 것 외에 사이트가 얻는
            수익은 없습니다.
          </p>
        )}
        <p>
          앞으로 광고를 게재하거나 제휴 관계가 생기면 <strong>이 페이지를 먼저 갱신해</strong> 어떤
          형태의 광고인지, 어떤 업체와 어떤 관계인지 밝힙니다.
        </p>

        <h2>광고를 도입할 경우의 원칙</h2>
        <p>
          사이트에 광고나 제휴 링크가 도입되더라도 아래 원칙을 지킵니다.
        </p>
        <ul>
          <li>
            광고는 <strong>&lsquo;광고&rsquo; 또는 &lsquo;Advertisement&rsquo;로 명확히 표시</strong>
            하며, 일반 콘텐츠처럼 보이게 하지 않습니다.
          </li>
          <li>
            상영시간표 바로가기 버튼처럼 이용자가 누르려는 요소 바로 옆에 광고를 배치하지 않습니다.
          </li>
          <li>
            제휴 링크에는 <code>rel=&quot;sponsored&quot;</code> 표시를 적용하고, 해당 위치에 경제적
            이해관계가 있음을 밝힙니다.
          </li>
          <li>
            <strong>제휴 여부가 정보의 내용, 비교 기준, 노출 순서에 영향을 주지 않습니다.</strong>{' '}
            지점 정렬은 지역과 이름 기준이며, 대가를 받고 특정 지점이나 브랜드를 위로 올리지
            않습니다.
          </li>
          <li>본문을 가리거나 읽기를 방해하는 전면 광고, 자동 리디렉션을 사용하지 않습니다.</li>
        </ul>

        <h2>공식 사이트 링크에 대하여</h2>
        <p>
          각 지점 페이지에서 제공하는 &lsquo;공식 상영시간표 열기&rsquo;와 &lsquo;공식
          페이지&rsquo; 링크는 <strong>제휴 링크가 아닙니다.</strong> 이용자가 정확한 최신 정보를
          확인할 수 있도록 해당 영화관의 공식 페이지로 연결하는 것이며, 이 링크를 통한 이동이나
          예매로 사이트가 수익을 얻지 않습니다.
        </p>
        <p>
          추후 제휴 프로그램에 참여하게 되면 그 사실과 대상 링크를 이 페이지에 명시합니다.
        </p>

        <h2>콘텐츠 작성 기준</h2>
        <p>
          사이트의 지점 정보는 각 영화관 공식 웹사이트에 공개된 내용을 기준으로 정리합니다. 특정
          브랜드로부터 대가를 받고 정보를 왜곡하거나, 유리하게 서술하거나, 불리한 정보를 빼지
          않습니다.
        </p>

        <h2>문의</h2>
        <p>
          광고나 제휴에 관한 문의는 <a href={`mailto:${SITE.email}`}>{SITE.email}</a>로 보내주시기
          바랍니다. 관련 내용은 <Link href="/terms/">이용약관</Link>과{' '}
          <Link href="/disclaimer/">면책 고지</Link>도 함께 참고해 주세요.
        </p>
      </div>
    </div>
  );
}
