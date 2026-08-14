import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';
import { meta, branches, brandMeta, brandBySegment, findBranchByPageSlug } from '@/lib/data';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 지점 425곳 + 브랜드 허브 3곳 전용 공유 미리보기 이미지. 루트의
 * app/opengraph-image.tsx는 홈 하나에만 적용되고 이 라우트 아래는
 * 파일이 없으면 미리보기 이미지 자체가 없는 채로 공유됐다(카카오톡·
 * 슬랙 등에서 빈 카드로 노출). 페이지와 같은 params를 받으므로
 * generateStaticParams도 page.tsx와 동일하게 맞춰야 한다.
 */
export function generateStaticParams() {
  const brandParams = meta.brands.map((b) => ({ slug: b.segment }));
  const branchParams = branches.map((b) => ({ slug: b.pageSlug }));
  return [...brandParams, ...branchParams];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const brandKey = brandBySegment(decoded);
  const branch = !brandKey ? findBranchByPageSlug(decoded) : null;

  let title: string = SITE.name;
  let subtitle = 'CGV · 롯데시네마 · 메가박스 전국 지점 정보';
  let badge = '';

  if (brandKey) {
    const info = brandMeta(brandKey);
    title = `${info.name} 상영시간표·전국 지점 안내`;
    subtitle = `전국 ${info.count}개 지점의 위치·교통·주차·관람료`;
    badge = info.name;
  } else if (branch) {
    const info = brandMeta(branch.brand);
    title = `${branch.name} ${info.name}`;
    subtitle = `상영시간표·주차·관람료 안내 · ${branch.sido}`;
    badge = info.name;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#16202c',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div
            style={{
              display: 'flex',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#4f46e5',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 24,
            }}
          >
            ▶
          </div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#a7afba' }}>
            {SITE.name}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#a7afba', marginTop: 20 }}>
          {subtitle}
        </div>

        {badge && (
          <div style={{ display: 'flex', marginTop: 56 }}>
            <div
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '2px solid #3d4854',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {badge}
            </div>
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
