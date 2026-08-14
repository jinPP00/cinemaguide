import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * iOS 홈 화면 추가용 아이콘. app/icon.svg(파비콘)와 같은 디자인이지만
 * iOS는 SVG 파비콘을 apple-touch-icon으로 대신 쓰지 않아 별도 PNG가
 * 필요하다 — 지금까지 이 파일이 없어서 apple-touch-icon 자체가 없었다.
 * iOS가 모서리를 자체적으로 둥글려 마스킹하므로 여기선 각지게 채운다.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4f46e5',
          color: '#ffffff',
          fontSize: 84,
        }}
      >
        ▶
      </div>
    ),
    { ...size },
  );
}
