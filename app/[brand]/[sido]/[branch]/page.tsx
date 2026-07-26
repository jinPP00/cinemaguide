import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  meta,
  branches,
  brandBySegment,
  brandMeta,
  findBranch,
  branchesOfBrandSido,
  brandPath,
  sidoPath,
  branchPath,
} from '@/lib/data';

/** 425개 지점을 전부 정적 생성한다 */
export function generateStaticParams() {
  return branches.map((b) => ({
    brand: b.brandSegment,
    sido: b.sido,
    branch: b.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; sido: string; branch: string }>;
}): Promise<Metadata> {
  const { brand, sido: sidoRaw, branch: slugRaw } = await params;
  const key = brandBySegment(brand);
  if (!key) return {};
  const found = findBranch(key, decodeURIComponent(sidoRaw), decodeURIComponent(slugRaw));
  if (!found) return {};

  return {
    title: `${found.name} ${found.brandName} 상영시간표·주차·관람료 안내`,
    description: `${found.name} ${found.brandName}의 위치와 가는 길, 주차 조건, 관람료 정보입니다. 공식 상영시간표로 바로 이동할 수 있습니다.`,
    alternates: { canonical: branchPath(found) },
    // 1단계에서는 상세 내용이 아직 없으므로 색인하지 않는다. (기획서 10.2)
    // 교통·주차·요금 본문을 채운 뒤 이 설정을 제거하고 색인으로 전환한다.
    robots: { index: false, follow: true },
  };
}

export default async function BranchPage({
  params,
}: {
  params: Promise<{ brand: string; sido: string; branch: string }>;
}) {
  const { brand, sido: sidoRaw, branch: slugRaw } = await params;
  const key = brandBySegment(brand);
  if (!key) notFound();

  const sido = decodeURIComponent(sidoRaw);
  const slug = decodeURIComponent(slugRaw);
  const b = findBranch(key, sido, slug);
  if (!b) notFound();

  const info = brandMeta(key);

  // 같은 지역 다른 지점 (자기 자신 제외, 최대 6개)
  const siblings = branchesOfBrandSido(key, sido)
    .filter((x) => x.id !== b.id)
    .slice(0, 6);

  const mapUrl =
    b.mapLink ??
    (b.lat && b.lng
      ? `https://map.naver.com/p/search/${encodeURIComponent(
          `${b.brandName} ${b.name}`,
        )}?c=${b.lng},${b.lat},15,0,0,0,dh`
      : null);

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href={brandPath(info.segment)}>{info.name}</Link>
          </li>
          <li>
            <Link href={sidoPath(info.segment, sido)}>{sido}</Link>
          </li>
          <li>{b.name}</li>
        </ol>
      </nav>

      <h1>
        {b.name} {info.name} 상영시간표·주차·관람료 안내
      </h1>

      {b.status === '휴관' && (
        <p className="notice-closed">
          이 지점은 현재 <strong>휴관</strong> 중입니다. 운영 재개 여부는 공식 사이트에서
          확인하시기 바랍니다.
        </p>
      )}

      {/* 최상단 CTA — 이 페이지의 가장 중요한 요소 (기획서 3.1)
          시간표를 직접 제공하지 않는다는 점을 반드시 함께 밝힌다. */}
      <div className="cta-box">
        <div className="cta-text">
          <strong>오늘 상영시간표 보기</strong>
          <span>실시간 상영시간표는 {info.name} 공식 사이트에서 제공됩니다.</span>
        </div>
        <a
          className="cta-button"
          href={b.scheduleUrl}
          target="_blank"
          rel="noopener nofollow"
        >
          공식 상영시간표 열기 →
        </a>
      </div>

      {/* 기본 정보 */}
      <section className="section" aria-labelledby="basic">
        <h2 id="basic">기본 정보</h2>
        <dl className="info-list">
          <div>
            <dt>주소</dt>
            <dd>
              {b.address}
              {mapUrl && (
                <>
                  {' '}
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                    지도에서 보기
                  </a>
                </>
              )}
            </dd>
          </div>
          {b.tel && (
            <div>
              <dt>전화</dt>
              <dd>
                <a href={`tel:${b.tel}`}>{formatTel(b.tel)}</a>
              </dd>
            </div>
          )}
          {b.specialScreens.length > 0 && (
            <div>
              <dt>특별관</dt>
              <dd>{b.specialScreens.join(', ')}</dd>
            </div>
          )}
          {b.screenCount != null && (
            <div>
              <dt>상영관</dt>
              <dd>
                {b.screenCount}개관
                {b.seatCount != null && ` · 총 ${b.seatCount.toLocaleString()}석`}
              </dd>
            </div>
          )}
          <div>
            <dt>정보 확인일</dt>
            <dd>{b.checkedAt}</dd>
          </div>
        </dl>
      </section>

      {/* 1단계 안내 — 준비 중인 항목을 숨기지 않고 명시한다 */}
      <section className="section" aria-labelledby="coming">
        <h2 id="coming">준비 중인 정보</h2>
        <div className="note" style={{ marginTop: 12 }}>
          이 지점의 <strong>대중교통 이용 방법, 주차 조건과 요금, 상영관별 관람료</strong>는
          현재 정리 중입니다. 그전까지는 위 버튼으로 {info.name} 공식 페이지에서 확인하실 수
          있습니다.
        </div>
      </section>

      <section className="section" aria-labelledby="official">
        <h2 id="official">공식 사이트</h2>
        <p className="card-sub" style={{ marginTop: 6 }}>
          예매와 최신 정보는 공식 페이지에서 확인하세요.
        </p>
        <a
          className="chip"
          href={b.officialUrl}
          target="_blank"
          rel="noopener nofollow"
          style={{ marginTop: 10, display: 'inline-block' }}
        >
          {info.name} {b.name} 공식 페이지 →
        </a>
      </section>

      {siblings.length > 0 && (
        <section className="section" aria-labelledby="siblings">
          <h2 id="siblings">
            {sido} 지역 다른 {info.name} 지점
          </h2>
          <ul className="chip-list" style={{ marginTop: 14 }}>
            {siblings.map((s) => (
              <li key={s.id}>
                <Link className="chip" href={branchPath(s)}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 14 }}>
            <Link href={sidoPath(info.segment, sido)}>
              {sido} {info.name} 지점 전체 보기 →
            </Link>
          </p>
        </section>
      )}

      <section className="section">
        <div className="note">
          본 사이트는 {info.name} 공식 서비스와 무관한 비공식 정보 안내 사이트입니다. 지점 정보는{' '}
          {meta.checkedAt} 기준이며 변경될 수 있습니다. 잘못된 정보를 발견하셨다면{' '}
          <Link href="/contact/">정정 요청</Link>으로 알려주세요.
        </div>
      </section>
    </div>
  );
}

/** 0212345678 → 02-1234-5678 형태로 보기 좋게 */
function formatTel(tel: string): string {
  const d = tel.replace(/\D/g, '');
  if (d.startsWith('02') && d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.startsWith('02') && d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return tel;
}
