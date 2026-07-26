import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: '문의·정정 요청',
  description: '지점 정보 오류 신고, 정정 요청, 제휴 및 기타 문의를 받습니다.',
  alternates: { canonical: '/contact/' },
};

const CORRECTION_SUBJECT = encodeURIComponent('[정정 요청] 지점 정보 오류 신고');
const CORRECTION_BODY = encodeURIComponent(
  [
    '아래 항목을 채워 보내주시면 확인에 도움이 됩니다.',
    '',
    '- 브랜드 / 지점명 :',
    '- 해당 페이지 주소 :',
    '- 잘못된 내용 :',
    '- 올바른 내용 :',
    '- 확인 근거(있다면) :',
    '',
  ].join('\n'),
);

export default function ContactPage() {
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>문의·정정 요청</li>
        </ol>
      </nav>

      <h1>문의·정정 요청</h1>

      <div className="prose">
        <p>
          지점 정보의 오류를 발견하셨거나 문의하실 내용이 있으면 아래 이메일로 보내주세요. 확인 후
          바로 수정합니다.
        </p>

        <div className="cta-box" style={{ marginTop: 24 }}>
          <div className="cta-text">
            <strong>{SITE.email}</strong>
            <span>정정 요청은 아래 버튼을 누르면 양식이 자동으로 채워집니다.</span>
          </div>
          <a
            className="cta-button"
            href={`mailto:${SITE.email}?subject=${CORRECTION_SUBJECT}&body=${CORRECTION_BODY}`}
          >
            정정 요청 메일 쓰기 →
          </a>
        </div>

        <h2>정정 요청할 때 알려주시면 좋은 것</h2>
        <p>
          아래 내용을 함께 보내주시면 확인이 훨씬 빨라집니다. 전부 채우지 않으셔도 괜찮습니다.
        </p>
        <ul>
          <li>브랜드와 지점명 (예: CGV 강남)</li>
          <li>문제가 있는 페이지 주소</li>
          <li>현재 잘못 표시된 내용</li>
          <li>올바른 내용</li>
          <li>확인하신 근거가 있다면 함께 (공식 페이지 주소, 현장 확인 등)</li>
        </ul>

        <h2>처리 절차</h2>
        <ol>
          <li>접수한 내용을 공식 사이트 등에서 확인합니다.</li>
          <li>사실로 확인되면 바로 수정합니다.</li>
          <li>확인이 어려운 내용은 표시를 보류하거나 &lsquo;확인 필요&rsquo;로 남겨둡니다.</li>
        </ol>
        <p>
          운영자가 1인으로 운영하는 사이트라 답변까지 시간이 걸릴 수 있는 점 양해 부탁드립니다.
          답변이 필요 없는 단순 정정 제보는 회신 없이 반영될 수 있습니다.
        </p>

        <h2>이런 문의는 도와드릴 수 없습니다</h2>
        <p>
          이 사이트는 영화관 공식 서비스가 아니므로 아래 사항은 각 영화관 고객센터로 문의하셔야
          합니다.
        </p>
        <ul>
          <li>예매, 취소, 환불, 결제</li>
          <li>포인트·멤버십·쿠폰</li>
          <li>분실물, 현장 불편사항</li>
          <li>상영 일정 변경 요청</li>
        </ul>
        <p>
          각 지점 페이지의 공식 사이트 링크를 통해 해당 브랜드 고객센터로 이동하실 수 있습니다.
        </p>

        <h2>제휴·광고 문의</h2>
        <p>
          제휴나 광고 관련 문의도 같은 이메일로 받습니다. 제휴 관계가 생기면{' '}
          <Link href="/affiliate-disclosure/">광고·제휴 고지</Link>에 그 내용을 공개합니다.
        </p>

        <h2>개인정보 안내</h2>
        <p>
          문의 메일에는 답변에 필요한 최소한의 정보만 담아주세요. 메일로 받은 개인정보의 처리
          방법은 <Link href="/privacy/">개인정보처리방침</Link>에 안내되어 있습니다.
        </p>
      </div>
    </div>
  );
}
