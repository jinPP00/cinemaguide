import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { meta, brandPath } from '@/lib/data';

export const metadata: Metadata = withOpenGraphUrl({
  title: '문의·정정 요청',
  description: '지점 정보 오류 신고, 정정 요청, 처리 절차 및 영화관 브랜드별 공식 고객센터 안내를 제공합니다.',
  alternates: { canonical: '/contact/' },
});

const CORRECTION_SUBJECT = encodeURIComponent('[정정 요청] 지점 정보 오류 신고');
const CORRECTION_BODY = encodeURIComponent(
  [
    '아래 항목을 채워 보내주시면 확인에 도움이 됩니다.',
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
          {SITE.name}은 전국 {meta.totalBranches}개 영화관 지점의 관람료, 주차 요금·인증 방법,
          대중교통 경로를 정확하게 유지하기 위해 정기 점검과 이용자 제보를 함께 운영하고 있습니다.
          지점 페이지의 내용이 실제 현장 안내나 공식 공지와 다른 부분을 발견하셨거나 사이트 이용과
          관련해 문의하실 사항이 있다면 아래 이메일로 알려주시기 바랍니다.
        </p>

        <div className="cta-box" style={{ marginTop: 24 }}>
          <div className="cta-text">
            <strong>{SITE.email}</strong>
            <span>정정 요청은 아래 버튼을 누르면 이메일 양식이 자동으로 채워집니다.</span>
          </div>
          <a
            className="cta-button"
            href={`mailto:${SITE.email}?subject=${CORRECTION_SUBJECT}&body=${CORRECTION_BODY}`}
          >
            정정 요청 메일 쓰기 →
          </a>
        </div>

        <h2>1. 정정 요청이 필요한 주요 사례</h2>
        <p>
          영화관과 입점 건물의 운영 정책은 예고 없이 변경되는 경우가 있습니다. 아래와 같은 변경
          사항을 알려주시면 다른 방문자들이 헛걸음하거나 예상치 못한 추가 요금을 부담하는 일을
          예방하는 데 큰 도움이 됩니다.
        </p>
        <ul>
          <li>
            <strong>주차 조건 및 요금 변경</strong>: 무료 주차 제공 시간 축소·확대, 주차 정산 방식
            변경(예: 매표소 인증에서 티켓 바코드 무인정산기 또는 태블릿 차량번호 등록으로 변경),
            제휴 주차장 계약 종료, 추가 과금 단위 요금 인상 등
          </li>
          <li>
            <strong>관람료 및 상영관 구성 변경</strong>: 일반관의 리클라이너관 전환에 따른 기본 요금
            변경, 조조(모닝)·심야 요금 조정, 특별관 신설 또는 운영 중단 등
          </li>
          <li>
            <strong>대중교통 및 출입 동선 변경</strong>: 인접 지하철역 출구 번호 변경·공사 폐쇄,
            심야 상영 종료 후 쇼핑몰·백화점 전용 엘리베이터 및 출차 통로 변경, 버스 노선 개편 등
          </li>
          <li>
            <strong>지점 운영 상태 변경</strong>: 리뉴얼 공사로 인한 임시 휴관, 영업 종료(폐점) 예정
            공지, 도로명주소 또는 대표 전화번호 변경 등
          </li>
        </ul>

        <h2>2. 정정 요청 확인 및 반영 절차</h2>
        <ol>
          <li>
            <strong>제보 접수</strong>: 보내주신 이메일에서 대상 지점명과 수정 요청 항목(주차·요금·교통·기본정보)을
            확인합니다. 모든 양식을 다 채우지 않으셔도 지점명과 바뀐 내용만 적어주시면 확인이 가능합니다.
          </li>
          <li>
            <strong>공식 출처 교차 검증</strong>: 해당 영화관 브랜드의 공식 웹사이트 지점 페이지,
            공지사항, 또는 보내주신 현장 안내문 근거를 대조하여 사실관계를 검증합니다.
          </li>
          <li>
            <strong>데이터 갱신 및 배포</strong>: 사실로 확인된 내용은 지점 데이터베이스와 구조화
            파서에 즉시 반영하고, 해당 지점 페이지의 &lsquo;출처 및 확인 시점&rsquo; 날짜를 갱신하여
            재배포합니다. 공식 출처에서도 확인이 어려운 항목은 추측해 적지 않고 보수적으로 안내합니다.
          </li>
        </ol>
        <p>
          운영자 1인이 관리하는 사이트 특성상 개별 회신까지 영업일 기준 1~3일이 소요될 수 있으며,
          별도의 답변 요청이 없는 단순 정보 오탈자·수치 정정 제보는 별도 회신 없이 사이트 반영으로
          갈음될 수 있는 점 양해 부탁드립니다.
        </p>

        <h2>3. 이 사이트에서 처리할 수 없는 문의 (공식 고객센터 안내)</h2>
        <p>
          {SITE.name}은 각 영화관 브랜드와 무관한 <strong>비공식 정보 안내 사이트</strong>입니다.
          따라서 아래와 같은 현장 운영 및 거래 관련 업무는 본 사이트에서 조회하거나 처리할 수
          없으며, 반드시 해당 영화관의 공식 홈페이지·모바일 앱 또는 고객센터를 통해 문의하셔야
          합니다.
        </p>
        <ul>
          <li>영화 티켓 예매, 결제 오류, 예매 취소 및 환불 요청</li>
          <li>멤버십 포인트 적립·차감, VIP 승급, 관람권·기프티콘·할인 쿠폰 등록 문의</li>
          <li>상영관 내 분실물(유실물) 습득 여부 확인 및 보관 요청</li>
          <li>주차 사전 정산 누락에 따른 주차비 환불 요청 및 현장 시설 불편 신고</li>
          <li>단체 관람·대관 문의 및 실시간 상영 일정 편성 문의</li>
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
                    <Link href={brandPath(b.segment)}>{b.name} 지점 목록에서 공식 페이지 이동 →</Link>
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
