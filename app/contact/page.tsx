import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { meta, brandPath } from '@/lib/data';

export const metadata: Metadata = withOpenGraphUrl({
  title: '문의·정정 요청',
  description: '지점 정보가 틀렸을 때 알리는 방법, 처리 순서, 이 사이트에서 처리할 수 없는 문의.',
  alternates: { canonical: '/contact/' },
});

const CORRECTION_SUBJECT = encodeURIComponent('[정정 요청] 지점 정보 오류 신고');
const CORRECTION_BODY = encodeURIComponent(
  [
    '아래 항목을 채워 주시면 확인이 빨라집니다.',
    '',
    '- 브랜드 / 지점명 :',
    '- 해당 페이지 주소 :',
    '- 잘못된 내용 :',
    '- 올바른 내용 :',
    '- 확인 근거(현장 안내문 사진, 공식 공지 링크 등) :',
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
          지점 페이지의 내용이 현장 안내나 공식 공지와 다르면 알려 주세요. {meta.totalBranches}개 지점의
          요금, 주차, 교통편은 정기 점검과 제보로 고쳐 나가고 있습니다. 사이트에 관한 다른 문의도 같은
          주소로 받습니다.
        </p>

        <div className="cta-box" style={{ marginTop: 24 }}>
          <div className="cta-text">
            <strong>{SITE.email}</strong>
            <span>버튼을 누르면 정정 요청 양식이 채워진 메일이 열립니다.</span>
          </div>
          <a
            className="cta-button"
            href={`mailto:${SITE.email}?subject=${CORRECTION_SUBJECT}&body=${CORRECTION_BODY}`}
          >
            정정 요청 메일 쓰기
          </a>
        </div>

        <h2>이런 걸 알려 주세요</h2>
        <p>
          영화관과 건물의 운영 방식은 예고 없이 바뀝니다. 아래 같은 변화를 알려 주시면 다른 사람이 헛걸음하거나
          생각지 못한 요금을 내는 일을 줄일 수 있습니다.
        </p>
        <ul>
          <li>
            <strong>주차</strong>: 무료 시간이 줄거나 늘었을 때, 정산 방법이 바뀌었을 때(예: 매표소 인증에서
            정산기 바코드나 태블릿 등록으로), 제휴 주차장이 끝났을 때, 초과 요금이 올랐을 때
          </li>
          <li>
            <strong>요금과 상영관</strong>: 일반관이 리클라이너관으로 바뀌어 기본 요금이 달라졌을 때, 조조·심야
            요금이 바뀌었을 때, 특별관이 생기거나 없어졌을 때
          </li>
          <li>
            <strong>교통과 동선</strong>: 가까운 지하철역 출구 번호가 바뀌거나 공사로 막혔을 때, 심야 상영 뒤
            쓰는 엘리베이터나 출차 통로가 바뀌었을 때, 버스 노선이 바뀌었을 때
          </li>
          <li>
            <strong>운영 상태</strong>: 리뉴얼로 잠시 문을 닫았을 때, 영업 종료가 예정됐을 때, 주소나 대표 번호가
            바뀌었을 때
          </li>
        </ul>

        <h2>보내 주신 뒤에는</h2>
        <ol>
          <li>
            <strong>접수</strong>: 메일에서 지점 이름과 바뀐 항목(주차·요금·교통·기본 정보)을 확인합니다. 양식을 다
            채우지 않아도 지점 이름과 바뀐 내용만 있으면 됩니다.
          </li>
          <li>
            <strong>확인</strong>: 그 브랜드의 공식 지점 페이지, 공지사항, 보내 주신 현장 사진 등을 대조합니다.
          </li>
          <li>
            <strong>반영</strong>: 맞는 내용은 지점 자료에 바로 고치고, 지점 페이지의 &lsquo;정보 확인일&rsquo;도
            바꿉니다. 공식 출처에서 확인할 수 없는 내용은 짐작해 적지 않습니다.
          </li>
        </ol>
        <p>
          한 사람이 운영하는 사이트라 답장까지 영업일 기준 1~3일 걸릴 수 있습니다. 답장을 요청하지 않은 단순한
          오탈자·숫자 정정은 따로 답장하지 않고 사이트에 고치는 것으로 대신할 수 있습니다.
        </p>

        <h2>여기서 처리할 수 없는 문의</h2>
        <p>
          {SITE.name}은 영화관 브랜드와 관계없는 <strong>비공식 안내 사이트</strong>입니다. 아래 일은 이
          사이트에서 조회하거나 처리할 수 없으니 해당 영화관의 공식 홈페이지, 앱, 고객센터로 문의하세요.
        </p>
        <ul>
          <li>예매, 결제 오류, 예매 취소와 환불</li>
          <li>멤버십 포인트, VIP 등급, 관람권·기프티콘·쿠폰 등록</li>
          <li>상영관에서 잃어버린 물건 찾기</li>
          <li>주차 등록을 못 해 낸 주차비 환불, 현장 시설 불편</li>
          <li>단체 관람, 대관, 상영 일정 문의</li>
        </ul>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>브랜드</th>
                <th>공식 운영사</th>
                <th>사이트 내 지점 안내</th>
              </tr>
            </thead>
            <tbody>
              {meta.brands.map((b) => (
                <tr key={b.key}>
                  <th>{b.name}</th>
                  <td>
                    {b.key === 'cgv'
                      ? 'CJ CGV㈜'
                      : b.key === 'lotte'
                        ? '롯데컬처웍스㈜'
                        : '㈜메가박스중앙'}
                  </td>
                  <td>
                    <Link href={brandPath(b.segment)}>{b.name} 지점 목록</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>4. 광고·제휴 문의 및 개인정보 안내</h2>
        <p>
          사이트 운영과 관련한 기타 의견이나 광고·제휴 문의도 동일한 이메일(<a href={`mailto:${SITE.email}`}>{SITE.email}</a>)로
          접수합니다. 광고 및 제휴 링크 운영 원칙은{' '}
          <Link href="/affiliate-disclosure/">광고·제휴 고지</Link> 페이지에 투명하게 공개되어
          있으며, 문의 이메일을 통해 전달된 발신자 정보는 문의 처리 목적 외에는 절대 사용되지
          않습니다. 자세한 내용은 <Link href="/privacy/">개인정보처리방침</Link>과{' '}
          <Link href="/about/">사이트 소개</Link>를 참고해 주세요.
        </p>
      </div>
    </div>
  );
}
