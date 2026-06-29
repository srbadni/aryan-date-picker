export type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
};

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getMonthLabel(month: Date) {
  return month.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function createCalendarMonth(month: Date): CalendarDay[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startDate = new Date(year, monthIndex, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + index,
    );

    return {
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthIndex,
    };
  });
}
