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
          지점 정보의 오류를 발견하셨거나 문의하실 내용이 있으면 아래 이메일로 보내주세요. 브랜드와
          지점명, 문제가 있는 페이지 주소, 잘못된 내용과 올바른 내용을 함께 보내주시면 확인이
          빨라지지만 전부 채우지 않으셔도 괜찮습니다. 접수된 내용은 공식 사이트 등에서 확인 후
          사실로 확인되면 바로 반영하고, 확인이 어려운 내용은 &lsquo;확인 필요&rsquo;로 남겨둡니다.
          운영자 1인이 운영하는 사이트라 답변까지 시간이 걸릴 수 있는 점 양해 부탁드리며, 답변이
          필요 없는 단순 정정 제보는 회신 없이 반영될 수 있습니다.
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

        <h2>이런 문의는 도와드릴 수 없습니다</h2>
        <p>
          이 사이트는 영화관 공식 서비스가 아니라서 예매·취소·환불·결제, 포인트·멤버십·쿠폰,
          분실물·현장 불편사항, 상영 일정 변경 요청은 각 지점 페이지의 공식 사이트 링크를 통해
          해당 브랜드 고객센터로 문의하셔야 합니다.
        </p>

        <h2>그 밖의 안내</h2>
        <p>
          제휴·광고 문의도 같은 이메일로 받으며, 제휴 관계가 생기면{' '}
          <Link href="/affiliate-disclosure/">광고·제휴 고지</Link>에 공개합니다. 문의 메일에는
          답변에 필요한 최소한의 정보만 담아주시고, 메일로 받은 개인정보의 처리 방법은{' '}
          <Link href="/privacy/">개인정보처리방침</Link>에서 확인하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}
