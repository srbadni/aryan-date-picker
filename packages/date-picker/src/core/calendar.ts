import { defaultCalendarAdapter, type CalendarDay } from './calendarAdapter';

export type { CalendarDay };

export const WEEKDAY_LABELS = defaultCalendarAdapter.getWeekdayLabels();
export const getMonthLabel = defaultCalendarAdapter.formatMonthLabel;
export const addMonths = defaultCalendarAdapter.addMonths;
export const addDays = defaultCalendarAdapter.addDays;
export const createCalendarMonth = defaultCalendarAdapter.createCalendarMonth;
