import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';
import { sameDailyBoxOffice, yesterdayInKorea } from '../scripts/boxoffice-data.mjs';

const movie = { rank: 1, movieCd: '123', name: '테스트 영화', openDate: '2026-09-23', audienceToday: 100, audienceTotal: 1000, salesShare: 30 };
const previous = { targetDate: '20260927', movies: [{ ...movie, directors: ['감독'] }] };

test('같은 영화 순서에서도 집계일과 일별 수치 변경을 저장한다', () => {
  assert.equal(sameDailyBoxOffice(previous, '20260928', [movie]), false);
  for (const key of ['audienceToday', 'audienceTotal', 'salesShare', 'rank']) {
    assert.equal(sameDailyBoxOffice(previous, previous.targetDate, [{ ...movie, [key]: movie[key] + 1 }]), false, key);
  }
  assert.equal(sameDailyBoxOffice(previous, previous.targetDate, []), false);
  assert.equal(sameDailyBoxOffice(null, previous.targetDate, [movie]), false);
  assert.equal(sameDailyBoxOffice(previous, previous.targetDate, [movie]), true);
});

test('조회일은 러너 시간대와 무관하게 한국의 어제다', () => {
  assert.equal(yesterdayInKorea(new Date('2026-10-04T00:00:00Z')), '20261003');
  assert.equal(yesterdayInKorea(new Date('2026-10-04T16:00:00Z')), '20261004');
  assert.equal(yesterdayInKorea(new Date('2025-12-31T15:01:00Z')), '20251231');
});

test('HTTP와 www는 경로·한글·검색 파라미터를 보존해 HTTPS 대표 주소로 이동한다', async () => {
  const env = { ASSETS: { fetch() { throw new Error('리다이렉트 전에 자산을 읽으면 안 됩니다.'); } } };
  for (const origin of ['http://cinemaguide.kr', 'http://www.cinemaguide.kr', 'https://www.cinemaguide.kr']) {
    const response = await worker.fetch(new Request(`${origin}/서울강남-cgv/?ref=검색&sort=1`, { method: 'POST' }), env);
    assert.equal(response.status, 308);
    const destination = new URL(response.headers.get('location'));
    assert.equal(destination.origin, 'https://cinemaguide.kr');
    assert.equal(decodeURIComponent(destination.pathname), '/서울강남-cgv/');
    assert.equal(destination.searchParams.get('ref'), '검색');
    assert.equal(destination.searchParams.get('sort'), '1');
  }
});

test('대표 HTTPS와 로컬 주소의 자산·404·헤더는 그대로 반환한다', async () => {
  for (const origin of ['https://cinemaguide.kr', 'http://localhost:8787']) {
    const request = new Request(`${origin}/missing/`);
    const asset = new Response('없는 페이지', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
    const response = await worker.fetch(request, { ASSETS: { fetch(value) { assert.equal(value, request); return asset; } } });
    assert.equal(response, asset);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  }
});
