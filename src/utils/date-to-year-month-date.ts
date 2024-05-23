const formatter = Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getYearMonthDateString(date: Date) {
  const parts = new Map(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );

  return `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}`;
}
