import test from 'node:test';
import assert from 'node:assert/strict';
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
