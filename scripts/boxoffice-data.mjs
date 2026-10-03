const DAILY_FIELDS = ['rank', 'movieCd', 'name', 'openDate', 'audienceToday', 'audienceTotal', 'salesShare'];

/** 순서가 그대로여도 집계일·관객 수·매출 점유율이 바뀌면 새 데이터다. */
export function sameDailyBoxOffice(previous, targetDate, movies) {
  if (!previous || previous.targetDate !== targetDate || previous.movies.length !== movies.length) return false;
  return movies.every((movie, i) => DAILY_FIELDS.every(key => previous.movies[i][key] === movie[key]));
}

/** GitHub 러너의 UTC 날짜 대신 KOBIS 집계 지역(한국)의 어제를 조회한다. */
export function yesterdayInKorea(now = new Date()) {
  const shifted = new Date(now.getTime() + (9 - 24) * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10).replaceAll('-', '');
}
