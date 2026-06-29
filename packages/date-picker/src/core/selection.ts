import { defaultCalendarAdapter, type CalendarAdapter } from './calendarAdapter';

export type DateRangeValue = {
  startDate: Date | null;
  endDate: Date | null;
};

export function selectSingleDate(date: Date) {
  return date;
}

export function selectDateRangeDate(
  currentRange: DateRangeValue,
  date: Date,
  adapter: Pick<CalendarAdapter, 'isBeforeDay'> = defaultCalendarAdapter,
): DateRangeValue {
  const { startDate, endDate } = currentRange;

  if (!startDate || endDate) {
    return { startDate: date, endDate: null };
  }

  if (adapter.isBeforeDay(date, startDate)) {
    return { startDate: date, endDate: startDate };
  }

  return { startDate, endDate: date };
}
