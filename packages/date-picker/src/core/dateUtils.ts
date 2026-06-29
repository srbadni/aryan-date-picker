export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(first: Date | null, second: Date | null) {
  if (!first || !second) {
    return false;
  }

  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

export function isBeforeDay(first: Date, second: Date) {
  return startOfDay(first).getTime() < startOfDay(second).getTime();
}

export function isBetweenDays(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) {
    return false;
  }

  const dayTime = startOfDay(date).getTime();
  const startTime = startOfDay(start).getTime();
  const endTime = startOfDay(end).getTime();

  return dayTime > startTime && dayTime < endTime;
}

export function formatInputDate(date: Date | null) {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
