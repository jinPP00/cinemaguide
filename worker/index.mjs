/** HTTPS·대표 도메인으로 한 번에 이동한 뒤 기존 정적 자산을 그대로 제공한다. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const productionHost = url.hostname === 'cinemaguide.kr' || url.hostname === 'www.cinemaguide.kr';
    if (productionHost && (url.protocol !== 'https:' || url.hostname !== 'cinemaguide.kr')) {
      url.protocol = 'https:';
      url.hostname = 'cinemaguide.kr';
      url.port = '';
      return new Response(null, {
        status: 308,
        headers: { Location: url.href, 'Cache-Control': 'public, max-age=3600' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
