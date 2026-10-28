import { withOpenGraphUrl } from '@/lib/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { LEGAL, REVISIONS } from '@/lib/legal';

export const metadata: Metadata = withOpenGraphUrl({
  title: '개인정보처리방침',
  description:
    '영화관 지점안내가 수집하는 개인정보 항목, 이용 목적, 보관 기간, 쿠키 및 맞춤형 광고 설정, 처리 위탁과 국외 이전, 이용자 권리를 안내합니다.',
  alternates: { canonical: '/privacy/' },
});

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
          {SITE.name}(이하 &lsquo;사이트&rsquo;)은 이용자의 개인정보를 소중히 여기며, 「개인정보
          보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수합니다.
          이 개인정보처리방침은 사이트가 어떤 정보를 수집하고 어떤 목적으로 활용하며, 이용자가 자신의
          권리와 쿠키·광고 설정을 어떻게 관리할 수 있는지를 실제 운영 상태에 맞추어 투명하게
          설명합니다.
        </p>

        <h2>1. 수집하는 개인정보 항목과 수집 방법</h2>
        <p>
          사이트는 별도의 회원가입, 로그인, 댓글 작성 기능을 운영하지 않으며, 전국 영화관 지점 정보와
          가이드를 열람하는 데에는 이름·전화번호·주소 등 어떠한 개인식별정보도 입력할 필요가 없습니다.
          서비스 운영 및 문의 처리 과정에서 발생할 수 있는 정보는 아래와 같습니다.
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
                <td>발신자 이메일 주소, 메일 제목 및 본문에 이용자가 자발적으로 기재한 내용</td>
                <td>이용자가 운영자 이메일로 직접 발송</td>
              </tr>
              <tr>
                <th>접속 기록 및 보안 로그</th>
                <td>접속 IP 주소, 접속 일시, 브라우저 종류·버전(User-Agent), 운영체제, 요청 URL, 참조 페이지(Referer)</td>
                <td>웹사이트 접속 시 호스팅 및 CDN 인프라에서 자동 생성</td>
              </tr>
              {LEGAL.usesAnalytics && (
                <tr>
                  <th>방문 통계 정보</th>
                  <td>쿠키 식별자, 방문 페이지, 체류 시간, 유입 경로, 기기·브라우저 환경 정보, 대략적인 지역</td>
                  <td>방문 통계 도구(Google Analytics) 스크립트를 통해 자동 생성</td>
                </tr>
              )}
              {LEGAL.usesAds && (
                <tr>
                  <th>광고 게재 및 쿠키 정보</th>
                  <td>쿠키 식별자, 광고 노출·클릭 상호작용 정보, 기기·브라우저 환경 정보</td>
                  <td>제3자 광고 서비스(Google AdSense) 스크립트를 통해 자동 생성</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p>
          일반 접속 기록은 사이트 운영자가 개인을 식별하기 위해 별도 데이터베이스에 저장하거나
          조합하지 않으며, 호스팅 사업자(Cloudflare)가 콘텐츠 전송, 트래픽 분산, 디도스(DDoS) 및
          비정상 접근 차단 등 보안 목적으로 처리합니다.
        </p>

        <h2>2. 개인정보의 이용 목적</h2>
        <ul>
          <li>
            <strong>이용자 문의 및 정보 정정 요청 처리</strong>: 영화관 지점 요금·주차·교통 안내 오류
            제보 확인, 사실관계 대조, 필요한 경우 처리 결과 회신
          </li>
          <li>
            <strong>콘텐츠 품질 유지 및 오류 개선</strong>: 폐점·휴관·요금 변경 등 제보된 사항의
            데이터베이스 반영 및 이력 관리
          </li>
          <li>
            <strong>서비스 안정성 확보 및 보안 관리</strong>: 웹 페이지의 정상적인 전송, 서버 장애
            대응, 악성 봇 및 비정상적 트래픽 차단
          </li>
          {LEGAL.usesAnalytics && (
            <li>
              <strong>방문 통계 분석</strong>: 많이 찾는 페이지와 유입 경로를 파악해 안내 내용과 화면을
              개선. 개인을 식별하는 용도로 쓰지 않습니다.
            </li>
          )}
          {LEGAL.usesAds && (
            <li>
              <strong>광고 게재 및 사이트 운영 재원 마련</strong>: 무료 정보 제공 서비스를 지속적으로
              유지하기 위한 디스플레이 광고 송출, 비정상 광고 클릭 방지 및 광고 성과 측정
            </li>
          )}
        </ul>
        <p>
          수집된 정보는 위 명시된 목적 범위 내에서만 이용되며, 목적 외의 용도로 이용하거나 이용자의
          동의 없이 제3자에게 판매·대여하지 않습니다.
        </p>

        <h2>3. 개인정보의 보관 기간과 파기 방법</h2>
        <ul>
          <li>
            <strong>문의 및 정정 요청 이메일</strong>: 문의 처리 완료 후 <strong>1년간 보관</strong>한
            뒤 지체 없이 영구 삭제합니다. 단, 발신자가 보관 기간 경과 전이라도 삭제를 요청하는 경우
            즉시 삭제합니다.
          </li>
          <li>
            <strong>자동 생성 접속 기록</strong>: 호스팅 및 보안 인프라 사업자(Cloudflare)의 로그 보관
            정책에 따라 일정 기간 보관 후 자동 파기됩니다.
          </li>
          <li>
            <strong>전자적 파일의 파기 방법</strong>: 기록을 재생할 수 없는 기술적 방법을 사용하여
            영구 삭제합니다.
          </li>
        </ul>
        <p>
          관계 법령에 따라 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 보관한 뒤
          파기합니다.
        </p>

        <h2>4. 쿠키(Cookie) 및 제3자 맞춤형 광고 안내</h2>
        {LEGAL.usesAnalytics || LEGAL.usesAds ? (
          <>
            <p>
              사이트는 원활한 서비스 운영과 광고 게재를 위해 Google LLC가 제공하는 웹 광고 서비스인{' '}
              <strong>Google AdSense(구글 애드센스)</strong>를 사용합니다. 이와 관련하여 쿠키 사용 및
              맞춤형 광고 제어 방법을 아래와 같이 안내합니다.
            </p>
            <ul>
              <li>
                <strong>제3자 제공업체의 쿠키 사용</strong>: Google을 포함한 제3자 광고 제공업체는
                쿠키(Cookie) 및 웹 비콘 기술을 사용하여 이용자가 본 사이트 또는 인터넷상의 다른
                웹사이트를 이전에 방문한 기록을 바탕으로 광고를 게재합니다.
              </li>
              <li>
                <strong>광고 쿠키의 역할</strong>: Google은 광고 쿠키를 사용함으로써 이용자의 본
                사이트 및 다른 사이트 방문 기록에 기반하여 Google 및 그 파트너사가 이용자에게 관련성
                높은 맞춤형 광고(Personalized Ads)를 제공할 수 있도록 합니다.
              </li>
              <li>
                <strong>맞춤형 광고 설정 해제 방법</strong>: 이용자는 언제든지{' '}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google 광고 설정(adssettings.google.com)
                </a>
                을 방문하여 맞춤형 광고 표시를 해제(Opt-out)할 수 있습니다. 또한{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.aboutads.info
                </a>
                를 방문하면 제3자 광고 사업자가 맞춤형 광고를 위해 쿠키를 사용하는 것을 일괄적으로
                차단하는 방법을 안내받을 수 있습니다.
              </li>
              {LEGAL.usesAnalytics && (
                <li>
                  <strong>방문 통계 도구</strong>: 사이트는 방문 통계를 위해 Google LLC의{' '}
                  <strong>Google Analytics</strong>를 사용하며, 이 과정에서 쿠키가 저장됩니다. 수집을
                  원하지 않으면{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google 애널리틱스 차단 브라우저 부가기능
                  </a>
                  을 설치하거나 브라우저에서 쿠키를 차단할 수 있습니다.
                </li>
              )}
              <li>
                <strong>브라우저 쿠키 차단 설정</strong>: 이용자는 사용 중인 웹 브라우저의 옵션을
                조정하여 모든 쿠키의 저장을 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든
                쿠키의 저장을 거부할 수 있습니다. (예: Chrome의 경우 &lsquo;설정 → 개인정보 보호 및
                보안 → 서드파티 쿠키&rsquo;, Safari의 경우 &lsquo;환경설정 → 개인정보 보호 → 크로스
                사이트 추적 방지&rsquo;) 쿠키 저장을 거부하더라도 사이트의 모든 영화관 정보와
                가이드를 열람하는 데에는 아무런 지장이 없습니다.
              </li>
            </ul>
          </>
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

        <h2>5. 개인정보 처리 위탁과 국외 이전</h2>
        <p>
          사이트는 안정적인 웹 호스팅, 이메일 수신 및 광고 제공을 위해 아래와 같이 글로벌 클라우드·IT
          사업자의 인프라를 이용하고 있으며, 이 과정에서 서비스 제공에 필요한 최소한의 기술적 정보가
          국외 서버로 전송·처리될 수 있습니다.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>사업자</th>
                <th>위탁 업무 및 역할</th>
                <th>이전되는 항목</th>
                <th>이전 국가 및 시점·방법</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{LEGAL.hosting.name}</td>
                <td>{LEGAL.hosting.role}</td>
                <td>IP 주소, 접속 일시, 브라우저 정보 등 접속 기록</td>
                <td>{LEGAL.hosting.country} (접속 시 네트워크 자동 전송)</td>
              </tr>
              <tr>
                <td>{LEGAL.emailProvider.name}</td>
                <td>{LEGAL.emailProvider.role}</td>
                <td>발신자 이메일 주소, 문의 내용</td>
                <td>{LEGAL.emailProvider.country} (이메일 발송 시 네트워크 전송)</td>
              </tr>
              {LEGAL.usesAnalytics && (
                <tr>
                  <td>{LEGAL.analyticsProvider.name}</td>
                  <td>{LEGAL.analyticsProvider.role}</td>
                  <td>쿠키 식별자, IP 주소, 방문 페이지, 브라우저·기기 정보</td>
                  <td>{LEGAL.analyticsProvider.country} (페이지 열람 시 네트워크 전송)</td>
                </tr>
              )}
              {LEGAL.usesAds && (
                <tr>
                  <td>{LEGAL.adsProvider.name}</td>
                  <td>{LEGAL.adsProvider.role}</td>
                  <td>쿠키 식별자, IP 주소, 브라우저·기기 정보, 광고 상호작용 정보</td>
                  <td>{LEGAL.adsProvider.country} (페이지 열람 시 네트워크 전송)</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p>
          이용자가 개인정보의 국외 이전을 원하지 않는 경우 브라우저에서 쿠키를 차단하거나, 사이트
          이용 또는 이메일 문의를 중단하는 방법으로 이전을 거부할 수 있습니다.
        </p>

        <h2>6. 개인정보의 제3자 제공</h2>
        <p>
          사이트는 이용자의 개인정보를 본 방침에서 고지한 범위를 넘어 제3자에게 제공하지 않습니다.
          다만 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의
          적법한 요구가 있는 경우에는 예외로 합니다.
        </p>

        <h2>7. 정보주체(이용자)의 권리와 행사 방법</h2>
        <p>이용자는 언제든지 아래의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>본인이 보낸 문의 이메일 등 개인정보의 열람 요구</li>
          <li>오류가 있는 경우 정정 요구</li>
          <li>보관 중인 문의 내역의 삭제 요구</li>
          <li>개인정보 처리 정지 요구</li>
        </ul>
        <p>
          위 권리 행사는 운영자 이메일(<a href={`mailto:${SITE.email}`}>{SITE.email}</a>)로 요청하실
          수 있으며, 접수 즉시 본인 여부를 확인한 뒤 지체 없이 조치하고 결과를 안내해 드립니다.
        </p>

        <h2>8. 아동의 개인정보 보호</h2>
        <p>
          사이트는 회원가입을 받지 않으며 만 14세 미만 아동의 개인정보를 의도적으로 수집하지
          않습니다. 만약 만 14세 미만 아동이 법정대리인의 동의 없이 이메일 문의 등을 통해 개인정보를
          전달한 사실이 확인되면 해당 정보를 지체 없이 파기합니다.
        </p>

        <h2>9. 개인정보의 안전성 확보 조치</h2>
        <ul>
          <li>
            <strong>전 구간 암호화 통신</strong>: 사이트의 모든 페이지는 TLS/HTTPS 암호화 프로토콜을
            통해 안전하게 전송됩니다.
          </li>
          <li>
            <strong>접근 권한 최소화 및 2단계 인증</strong>: 문의 이메일을 수신하는 관리자 계정은
            강력한 비밀번호와 2단계 인증(2FA)을 적용해 운영자 본인만 접근할 수 있도록 통제합니다.
          </li>
          <li>
            <strong>개인정보 수집 최소화 설계</strong>: 사이트 서버 내에 별도의 회원 DB나 개인정보
            저장소를 두지 않는 정적 아키텍처로 운영하여 유출 위험을 원천적으로 줄였습니다.
          </li>
        </ul>

        <h2>10. 개인정보 보호책임자 및 권익침해 구제방법</h2>
        <div className="table-scroll">
          <table>
            <tbody>
              <tr>
                <th>개인정보 보호책임자</th>
                <td>{SITE.operator}</td>
              </tr>
              <tr>
                <th>문의 연락처</th>
                <td>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하실 수 있습니다.
        </p>
        <ul>
          <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
          <li>개인정보침해신고센터 (한국인터넷진흥원): (국번없이) 118 (privacy.kisa.or.kr)</li>
          <li>대검찰청 사이버수사과: (국번없이) 1301 (www.spo.go.kr)</li>
          <li>경찰청 사이버범죄신고시스템: (국번없이) 182 (ecrm.police.go.kr)</li>
        </ul>

        <h2>11. 개인정보처리방침의 변경 및 개정 이력</h2>
        <p>
          법령, 정책 또는 서비스 기능·광고 도구의 변경에 따라 본 방침의 내용을 추가·삭제·수정하는
          경우에는 개정 일자와 개정 사유를 아래 이력 표에 명시하여 공지합니다.
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
