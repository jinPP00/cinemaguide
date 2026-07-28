import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 링크 공유(카카오톡·페이스북 등) 시 뜨는 미리보기 이미지.
 * 정적 export 사이트라 빌드 시점에 이미지 파일로 한 번 구워져 나간다 —
 * 별도 이미지 에셋 없이 여기 JSX/스타일만으로 생성한다.
 */
export default async function Image() {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
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

        <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, letterSpacing: '-0.02em' }}>
          전국 영화관 지점안내
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#a7afba', marginTop: 20 }}>
          CGV · 롯데시네마 · 메가박스 425개 지점 위치·교통·주차·관람료
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 56 }}>
          {['CGV', 'MEGABOX', 'LOTTE CINEMA'].map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '2px solid #3d4854',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
