/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 HTML로 내보낸다. 서버가 없으므로 Cloudflare Pages에 그대로 올릴 수 있다.
  output: 'export',

  // /cgv/서울/강남/ 처럼 끝에 슬래시가 붙은 형태로 통일한다.
  // canonical·sitemap·내부링크 형태를 하나로 맞추기 위한 것이다. (기획서 6.2)
  trailingSlash: true,

  // 정적 export에서는 Next.js 이미지 최적화 서버를 쓸 수 없다.
  images: { unoptimized: true },
};

export default nextConfig;
