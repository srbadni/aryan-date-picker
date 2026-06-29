import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type LayoutDirection = 'ltr' | 'rtl';

export type CalendarDay = {
  date: Date;
  day: string;
  isCurrentMonth: boolean;
};

export type CalendarAdapter = {
  locale: string | string[] | undefined;
  direction: LayoutDirection;
  today: () => Date;
  startOfDay: (date: Date) => Date;
  startOfMonth: (date: Date) => Date;
  endOfMonth: (date: Date) => Date;
  addMonths: (date: Date, amount: number) => Date;
  isBeforeDay: (first: Date, second: Date) => boolean;
  isSameDay: (first: Date | null, second: Date | null) => boolean;
  isSameMonth: (first: Date, second: Date) => boolean;
  isBetweenDays: (date: Date, start: Date | null, end: Date | null) => boolean;
  formatInputDate: (date: Date | null) => string;
  formatMonthLabel: (month: Date) => string;
  formatDayOfMonth: (date: Date) => string;
  getDateKey: (date: Date) => string;
  getWeekdayLabels: () => string[];
  createCalendarMonth: (month: Date) => CalendarDay[];
  createMonthSequence: (startMonth: Date, count: number) => Date[];
  parseDate: (value: string) => Date | null;
};

export type GregorianCalendarAdapterOptions = {
  locale?: string | string[];
  direction?: LayoutDirection;
  firstDayOfWeek?: number;
};

const RTL_LANGUAGE_CODES = new Set(['ar', 'fa', 'he', 'ur']);

function resolveDirection(locale: string | string[] | undefined, direction?: LayoutDirection): LayoutDirection {
  if (direction) {
    return direction;
  }

  const localeValue = Array.isArray(locale) ? locale[0] : locale;
  const languageCode = localeValue?.split('-')[0]?.toLowerCase();

  return languageCode && RTL_LANGUAGE_CODES.has(languageCode) ? 'rtl' : 'ltr';
}

function normalizeFirstDayOfWeek(firstDayOfWeek = 0) {
  return ((firstDayOfWeek % 7) + 7) % 7;
}

function getLocaleFirstDayOfWeek(locale: string | string[] | undefined) {
  const localeValue = Array.isArray(locale) ? locale[0] : locale;

  try {
    const LocaleConstructor = Intl.Locale as unknown as undefined | (new (tag?: string) => {
      weekInfo?: { firstDay?: number };
      getWeekInfo?: () => { firstDay?: number };
    });
    const intlLocale = LocaleConstructor ? new LocaleConstructor(localeValue) : null;
    const firstDay = intlLocale?.weekInfo?.firstDay ?? intlLocale?.getWeekInfo?.().firstDay;

    if (typeof firstDay === 'number') {
      return firstDay % 7;
    }
  } catch {
    // Fall back to the existing Sunday-first behavior when week metadata is unavailable.
  }

  return 0;
}

export function createGregorianCalendarAdapter(options: GregorianCalendarAdapterOptions = {}): CalendarAdapter {
  const { locale, direction } = options;
  const firstDayOfWeek = normalizeFirstDayOfWeek(options.firstDayOfWeek ?? getLocaleFirstDayOfWeek(locale));
  const resolvedDirection = resolveDirection(locale, direction);

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const adapter: CalendarAdapter = {
    locale,
    direction: resolvedDirection,
    today: () => new Date(),
    startOfDay,
    startOfMonth: (date) => new Date(date.getFullYear(), date.getMonth(), 1),
    endOfMonth: (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0),
    addMonths: (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1),
    isBeforeDay: (first, second) => startOfDay(first).getTime() < startOfDay(second).getTime(),
    isSameDay: (first, second) => {
      if (!first || !second) {
        return false;
      }

      return startOfDay(first).getTime() === startOfDay(second).getTime();
    },
    isSameMonth: (first, second) => first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth(),
    isBetweenDays: (date, start, end) => {
      if (!start || !end) {
        return false;
      }

      const dayTime = startOfDay(date).getTime();
      return dayTime > startOfDay(start).getTime() && dayTime < startOfDay(end).getTime();
    },
    formatInputDate: (date) => {
      if (!date) {
        return '';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    },
    formatMonthLabel: (month) => month.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
    formatDayOfMonth: (date) => String(date.getDate()),
    getDateKey: (date) => adapter.formatInputDate(date),
    getWeekdayLabels: () => Array.from({ length: 7 }, (_, index) => {
      const weekdayIndex = (firstDayOfWeek + index) % 7;
      const date = new Date(2024, 0, 7 + weekdayIndex);
      return date.toLocaleDateString(locale, { weekday: 'short' });
    }),
    createCalendarMonth: (month) => {
      const monthStart = adapter.startOfMonth(month);
      const gridStartOffset = (monthStart.getDay() - firstDayOfWeek + 7) % 7;
      const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - gridStartOffset);

      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);

        return {
          date,
          day: adapter.formatDayOfMonth(date),
          isCurrentMonth: adapter.isSameMonth(date, monthStart),
        };
      });
    },
    createMonthSequence: (startMonth, count) => Array.from({ length: count }, (_, monthOffset) => adapter.addMonths(startMonth, monthOffset)),
    parseDate: (value) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) {
        return null;
      }

      const [, year, month, day] = match;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== Number(year) ||
        parsedDate.getMonth() !== Number(month) - 1 ||
        parsedDate.getDate() !== Number(day)
      ) {
        return null;
      }

      return parsedDate;
    },
  };

  return adapter;
}

export const defaultCalendarAdapter = createGregorianCalendarAdapter();

const LocalizationContext = createContext<CalendarAdapter>(defaultCalendarAdapter);

export type LocalizationProviderProps = GregorianCalendarAdapterOptions & {
  adapter?: CalendarAdapter;
  children: ReactNode;
};

export function LocalizationProvider({ adapter, children, locale, direction, firstDayOfWeek }: LocalizationProviderProps) {
  const calendarAdapter = useMemo(
    () => adapter ?? createGregorianCalendarAdapter({ locale, direction, firstDayOfWeek }),
    [adapter, direction, firstDayOfWeek, locale],
  );

  return <LocalizationContext.Provider value={calendarAdapter}>{children}</LocalizationContext.Provider>;
}

export function useCalendarAdapter() {
  return useContext(LocalizationContext);
}
