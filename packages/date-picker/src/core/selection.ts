import { isBeforeDay } from './dateUtils';

export type DateRangeValue = {
  startDate: Date | null;
  endDate: Date | null;
};

export function selectSingleDate(date: Date) {
  return date;
}

export function selectDateRangeDate(currentRange: DateRangeValue, date: Date): DateRangeValue {
  const { startDate, endDate } = currentRange;

  if (!startDate || endDate) {
    return { startDate: date, endDate: null };
  }

  if (isBeforeDay(date, startDate)) {
    return { startDate: date, endDate: startDate };
  }

  return { startDate, endDate: date };
}
