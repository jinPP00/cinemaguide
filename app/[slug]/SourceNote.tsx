import Link from 'next/link';
import type { Branch } from '@/lib/types';
import { guidePath, GUIDES } from '@/lib/paths';

function formatDate(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
}

export default function SourceNote({ branch }: { branch: Branch }) {
  const checked = branch.checkedAt ? formatDate(branch.checkedAt) : null;
  const needsRecheck = branch.verificationStatus === '확인필요';

  return (
    <>
      <section className="section detail-guide-section" aria-labelledby="detail-guides">
        <h2 id="detail-guides">다른 정보 보기</h2>
        <ul className="guide-jump-list">
          <li><Link className="guide-jump-link" href={guidePath(GUIDES.boxoffice)}>영화순위</Link></li>
          <li><Link className="guide-jump-link" href={guidePath(GUIDES.fares)}>관람료 비교</Link></li>
          <li><Link className="guide-jump-link" href={guidePath(GUIDES.screens)}>특별관 안내</Link></li>
        </ul>
      </section>

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
    </>
  );
}
