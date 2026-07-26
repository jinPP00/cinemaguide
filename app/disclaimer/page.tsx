import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { LEGAL } from '@/lib/legal';
import { meta } from '@/lib/data';

export const metadata: Metadata = {
  title: '면책 고지',
  description:
    '영화관 지점안내는 각 영화관 공식 서비스와 무관한 비공식 정보 사이트입니다. 정보의 한계와 책임 범위를 안내합니다.',
  alternates: { canonical: '/disclaimer/' },
};

export default function DisclaimerPage() {
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>면책 고지</li>
        </ol>
      </nav>

      <h1>면책 고지</h1>

      <div className="prose">
        <p className="updated">시행일 {LEGAL.effectiveDate}</p>

        <h2>공식 서비스가 아닙니다</h2>
        <p>
          {SITE.name}은 <strong>CJ CGV㈜, 롯데컬처웍스㈜, ㈜메가박스중앙 및 각 공식 서비스와
          무관한 비공식 정보 안내 사이트</strong>입니다. 사이트는 위 회사들과 제휴, 위탁, 대행,
          후원 관계를 맺고 있지 않으며, 이들을 대표하거나 대리하지 않습니다.
        </p>
        <p>
          사이트에 사용된 브랜드명은 어떤 영화관의 정보인지 구분하기 위한 목적으로만 사용되며, 각
          명칭과 상표에 대한 권리는 해당 권리자에게 있습니다.
        </p>

        <h2>상영시간표를 제공하지 않습니다</h2>
        <p>
          상영시간표는 하루에도 여러 번 변경되는 정보입니다. 사이트가 이를 옮겨 적으면 실제와 다른
          정보를 안내하게 될 위험이 크기 때문에, <strong>사이트는 상영시간표를 직접 제공하지
          않습니다.</strong> 각 지점 페이지 상단의 버튼을 통해 해당 영화관의 공식 페이지에서
          확인하실 수 있습니다.
        </p>

        <h2>정보의 한계</h2>
        <p>
          사이트의 정보는 각 영화관 공식 웹사이트에 공개된 내용을 기준으로 정리한 것이며, 마지막
          확인일은 <strong>{meta.checkedAt}</strong>입니다. 아래 정보는 예고 없이 변경될 수
          있습니다.
        </p>
        <ul>
          <li>관람료 및 할인 조건</li>
          <li>주차 무료 시간, 초과 요금, 정산 방법</li>
          <li>운영 시간과 휴관 여부</li>
          <li>상영관 구성과 특별관 운영 여부</li>
          <li>대중교통 노선과 출입 경로</li>
        </ul>
        <p>
          사이트는 정보를 정확하게 유지하기 위해 노력하지만, 게시된 내용이 항상 최신이거나
          완전하다는 것을 보장하지 않습니다.
        </p>

        <h2>이용자의 확인 의무</h2>
        <p>
          예매, 결제, 방문 등 실제 비용이나 시간이 드는 결정을 하기 전에는 반드시 해당 영화관의
          공식 채널에서 최종 정보를 확인하시기 바랍니다. 확인 없이 사이트의 정보에만 의존해 발생한
          손해에 대해 운영자는 책임을 지지 않습니다.
        </p>

        <h2>요금·주차 정보에 관한 고지</h2>
        <p>
          가격, 요금, 할인, 이용 조건은 시점과 지점, 상영 포맷에 따라 달라질 수 있습니다. 사이트의
          정보는 참고용이며, 결제 또는 예매 전 공식 페이지에서 최종 금액과 조건을 확인하시기
          바랍니다.
        </p>

        <h2>외부 링크</h2>
        <p>
          사이트는 각 영화관 공식 페이지 등 외부 사이트로 연결되는 링크를 제공합니다. 링크된
          사이트의 내용, 서비스, 개인정보 처리에 대해서는 해당 사이트가 책임지며, 운영자는 이를
          보증하지 않습니다.
        </p>

        <h2>광고와 제휴</h2>
        <p>
          사이트의 광고 게재 및 제휴 관계 여부는{' '}
          <Link href="/affiliate-disclosure/">광고·제휴 고지</Link>에서 확인하실 수 있습니다.
        </p>

        <h2>정보 오류 신고</h2>
        <p>
          잘못된 정보를 발견하셨다면 <Link href="/contact/">문의·정정 요청</Link>으로 알려주세요.
          확인 후 수정하고 확인일을 갱신합니다.
        </p>
      </div>
    </div>
  );
}
