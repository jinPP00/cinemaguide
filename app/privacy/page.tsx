import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { LEGAL, REVISIONS } from '@/lib/legal';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description:
    '영화관 지점안내가 수집하는 개인정보 항목, 이용 목적, 보관 기간, 처리 위탁과 국외 이전, 이용자 권리를 안내합니다.',
  alternates: { canonical: '/privacy/' },
};

export default function PrivacyPage() {
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>개인정보처리방침</li>
        </ol>
      </nav>

      <h1>개인정보처리방침</h1>

      <div className="prose">
        <p className="updated">
          시행일 {LEGAL.effectiveDate} · 최종 개정일 {LEGAL.updatedDate}
        </p>

        <p>
          {SITE.name}(이하 &lsquo;사이트&rsquo;)은 이용자의 개인정보를 소중히 여기며, 관련 법령을
          준수합니다. 이 방침은 사이트가 어떤 정보를 수집하고 어떻게 다루는지를 실제 운영 상태에
          맞추어 설명합니다.
        </p>

        <h2>1. 수집하는 개인정보와 수집 방법</h2>
        <p>
          사이트는 회원가입 기능이 없으며, 지점 정보를 열람하는 데에는 어떤 개인정보도 입력할
          필요가 없습니다. 현재 수집하는 정보는 다음과 같습니다.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>수집 항목</th>
                <th>수집 방법</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>문의·정정 요청</th>
                <td>이메일 주소, 이용자가 메일 본문에 스스로 적은 내용</td>
                <td>이용자가 보낸 이메일</td>
              </tr>
              <tr>
                <th>접속 기록</th>
                <td>IP 주소, 접속 일시, 브라우저·기기 정보, 요청 주소</td>
                <td>호스팅 서비스에서 자동 생성</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          접속 기록은 사이트 운영자가 직접 수집하거나 별도로 저장하지 않으며, 호스팅 사업자가
          서비스 제공과 보안 목적으로 처리합니다.
        </p>

        <h2>2. 개인정보의 이용 목적</h2>
        <ul>
          <li>문의와 정정 요청에 대한 확인 및 답변</li>
          <li>게시 정보의 오류 확인과 수정</li>
          <li>서비스 제공에 필요한 접속 유지, 장애 대응, 보안 위협 차단</li>
        </ul>
        <p>
          수집한 정보를 위 목적 외의 용도로 이용하지 않으며, 마케팅 목적으로 활용하거나 제3자에게
          판매하지 않습니다.
        </p>

        <h2>3. 보관 기간과 파기</h2>
        <ul>
          <li>
            <strong>문의 이메일</strong>: 문의 처리 완료 후 1년까지 보관하며, 이후 삭제합니다.
            이용자가 삭제를 요청하면 지체 없이 삭제합니다.
          </li>
          <li>
            <strong>접속 기록</strong>: 호스팅 사업자의 정책에 따라 보관·삭제됩니다.
          </li>
        </ul>
        <p>
          다른 법령에서 일정 기간 보관을 요구하는 경우에는 해당 기간 동안 보관한 뒤 파기합니다.
        </p>

        <h2>4. 쿠키와 추적 기술</h2>
        {LEGAL.usesAnalytics || LEGAL.usesAds ? (
          <p>
            사이트는 이용 분석과 광고 제공을 위해 쿠키를 사용합니다. 이용자는 브라우저 설정에서
            쿠키 저장을 거부할 수 있습니다.
          </p>
        ) : (
          <>
            <p>
              <strong>현재 사이트는 쿠키를 사용하지 않습니다.</strong> 접속자 분석 도구와 광고를
              적용하지 않았기 때문에, 이용자를 식별하거나 행동을 추적하기 위한 쿠키를 저장하지
              않습니다.
            </p>
            <p>
              앞으로 접속 분석 도구나 광고를 도입하면 이 방침을 먼저 갱신하고, 어떤 도구를 어떤
              목적으로 사용하는지, 이용자가 어떻게 거부할 수 있는지 함께 안내합니다.
            </p>
          </>
        )}

        <h2>5. 처리 위탁과 국외 이전</h2>
        <p>
          사이트는 서비스 제공을 위해 아래 사업자의 서비스를 이용하며, 이 과정에서 개인정보가
          국외에 저장·처리될 수 있습니다.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>사업자</th>
                <th>역할</th>
                <th>이전되는 항목</th>
                <th>국가</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{LEGAL.hosting.name}</td>
                <td>{LEGAL.hosting.role}</td>
                <td>IP 주소, 접속 기록</td>
                <td>{LEGAL.hosting.country}</td>
              </tr>
              <tr>
                <td>{LEGAL.emailProvider.name}</td>
                <td>{LEGAL.emailProvider.role}</td>
                <td>이메일 주소, 문의 내용</td>
                <td>{LEGAL.emailProvider.country}</td>
              </tr>
              {LEGAL.usesAds && (
                <tr>
                  <td>{LEGAL.adsProvider.name}</td>
                  <td>{LEGAL.adsProvider.role}</td>
                  <td>쿠키 식별자, IP 주소, 광고 상호작용 정보</td>
                  <td>{LEGAL.adsProvider.country}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p>
          이전 시점은 서비스 이용 시점이며, 이전 방법은 네트워크를 통한 전송입니다. 이용자가 국외
          이전을 원하지 않는 경우 사이트 이용이나 이메일 문의를 하지 않는 방법으로 거부할 수
          있습니다.
        </p>

        <h2>6. 제3자 제공</h2>
        <p>
          사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 수사기관 등이
          적법한 절차로 요구하는 경우에는 관련 법령을 따릅니다.
        </p>

        <h2>7. 이용자의 권리와 행사 방법</h2>
        <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>본인의 개인정보 열람 요구</li>
          <li>오류가 있는 경우 정정 요구</li>
          <li>삭제 요구</li>
          <li>처리 정지 요구</li>
        </ul>
        <p>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>로 요청하시면 지체 없이 처리합니다.
          요청하신 분이 본인인지 확인이 필요한 경우 추가 확인을 요청할 수 있습니다.
        </p>

        <h2>8. 아동의 개인정보</h2>
        <p>
          사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지
          않습니다. 아동의 개인정보가 수집된 사실을 알게 되면 지체 없이 삭제합니다.
        </p>

        <h2>9. 안전성 확보 조치</h2>
        <ul>
          <li>사이트 전 구간 HTTPS 암호화 통신</li>
          <li>문의 이메일 계정의 접근 권한 최소화</li>
          <li>수집 항목 최소화 (회원가입·결제·위치정보 수집 없음)</li>
        </ul>

        <h2>10. 개인정보 보호 책임자</h2>
        <div className="table-scroll">
          <table>
            <tbody>
              <tr>
                <th>책임자</th>
                <td>{SITE.operator}</td>
              </tr>
              <tr>
                <th>연락처</th>
                <td>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          개인정보 침해에 대한 상담이 필요한 경우 개인정보분쟁조정위원회(1833-6972),
          개인정보침해신고센터(118), 대검찰청(1301), 경찰청(182) 등에 문의하실 수 있습니다.
        </p>

        <h2>11. 방침의 변경</h2>
        <p>
          법령이나 서비스 내용이 바뀌어 이 방침을 변경할 때에는 변경 사항을 이 페이지에 게시합니다.
          이용자에게 불리한 중요한 변경이 있는 경우에는 시행 전에 충분한 기간을 두고 알립니다.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>일자</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              {REVISIONS.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
