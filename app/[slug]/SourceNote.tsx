import type { Branch } from '@/lib/types';

/**
 * 이 페이지의 정보를 언제·어디서 확인했는지.
 *
 * 요금과 주차 조건은 바뀌는 정보라, 숫자만 있고 기준 시점이 없으면 사용자가
 * 믿을 근거가 없다. 확인일과 원 출처를 밝히고 공식 페이지로 바로 갈 수 있게
 * 둔다 — 이 사이트가 공식 서비스가 아니라는 점도 여기서 분명해진다.
 *
 * ⚠️ 날짜는 data/branches.json의 checkedAt을 그대로 쓴다. 표시할 날짜가 없다고
 * 오늘 날짜를 채워 넣으면 확인하지도 않은 것을 확인했다고 말하는 셈이 된다.
 */

/** "2026-07-23" → "2026년 7월 23일" */
function formatDate(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
}

export default function SourceNote({ branch }: { branch: Branch }) {
  const checked = branch.checkedAt ? formatDate(branch.checkedAt) : null;
  const needsRecheck = branch.verificationStatus === '확인필요';

  return (
    <section className="section source-section" aria-labelledby="source">
      <h2 id="source">정보 안내</h2>

      <dl className="source-list">
        <div>
          <dt>정보 확인일</dt>
          <dd>
            {checked ?? '확인 기록이 없습니다'}
            {needsRecheck && <span className="source-flag">재확인 필요</span>}
          </dd>
        </div>
        <div>
          <dt>자료 출처</dt>
          <dd>{branch.brandName} 공식 홈페이지</dd>
        </div>
      </dl>

      <div className="source-foot">
        <p className="source-caution">
          <span className="source-caution-icon" aria-hidden="true">i</span>
          <span>
            관람료·주차·운영 정보는 변경될 수 있습니다.
            {needsRecheck
              ? ' 이 지점은 재확인이 필요한 항목이 있으므로 방문 전 공식 페이지를 확인해 주세요.'
              : ' 방문 전 공식 페이지에서 최신 정보를 한 번 더 확인해 주세요.'}
          </span>
        </p>

        {branch.officialUrl && (
          <p className="source-link-row">
            <a
              className="source-official-link"
              href={branch.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              공식 페이지에서 최신 정보 확인
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
