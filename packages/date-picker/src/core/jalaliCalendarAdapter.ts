import type { CalendarAdapter, CalendarDay } from './calendarAdapter';

export type JalaliCalendarAdapterOptions = {
  locale?: string | string[];
  firstDayOfWeek?: number;
  latinDigits?: boolean;
};

type JalaliDateParts = { jy: number; jm: number; jd: number };

const JALALI_MONTH_NAMES = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const JALALI_WEEKDAY_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;

  if (jy < jp || jy >= breaks[bl - 1]) throw new Error(`Invalid Jalali year ${jy}`);

  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number): JalaliDateParts {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

function toJalali(date: Date) {
  return d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

function newJalaliDate(jy: number, jm: number, jd: number) {
  const g = d2g(j2d(jy, jm, jd));
  return new Date(g.gy, g.gm - 1, g.gd);
}

function isLeapJalaliYear(jy: number) {
  return jalCal(jy).leap === 0;
}

function getJalaliMonthLength(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaliYear(jy) ? 30 : 29;
}

function formatNumber(value: number, latinDigits: boolean) {
  const text = String(value);
  return latinDigits ? text : text.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function createJalaliCalendarAdapter(options: JalaliCalendarAdapterOptions = {}): CalendarAdapter {
  const locale = options.locale ?? 'fa-IR';
  const firstDayOfWeek = ((options.firstDayOfWeek ?? 6) % 7 + 7) % 7;
  const latinDigits = options.latinDigits ?? false;

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const adapter: CalendarAdapter = {
    locale,
    direction: 'rtl',
    today: () => new Date(),
    startOfDay,
    startOfMonth: (date) => {
      const j = toJalali(date);
      return newJalaliDate(j.jy, j.jm, 1);
    },
    endOfMonth: (date) => {
      const j = toJalali(date);
      return newJalaliDate(j.jy, j.jm, getJalaliMonthLength(j.jy, j.jm));
    },
    addMonths: (date, amount) => {
      const j = toJalali(date);
      const monthIndex = j.jy * 12 + (j.jm - 1) + amount;
      const jy = Math.floor(monthIndex / 12);
      const jm = ((monthIndex % 12) + 12) % 12 + 1;
      return newJalaliDate(jy, jm, Math.min(j.jd, getJalaliMonthLength(jy, jm)));
    },
    isBeforeDay: (first, second) => startOfDay(first).getTime() < startOfDay(second).getTime(),
    isSameDay: (first, second) => !!first && !!second && startOfDay(first).getTime() === startOfDay(second).getTime(),
    isSameMonth: (first, second) => {
      const a = toJalali(first);
      const b = toJalali(second);
      return a.jy === b.jy && a.jm === b.jm;
    },
    isBetweenDays: (date, start, end) => !!start && !!end && startOfDay(date).getTime() > startOfDay(start).getTime() && startOfDay(date).getTime() < startOfDay(end).getTime(),
    formatInputDate: (date) => {
      if (!date) return '';
      const j = toJalali(date);
      return `${String(j.jy).padStart(4, '0')}-${String(j.jm).padStart(2, '0')}-${String(j.jd).padStart(2, '0')}`;
    },
    formatMonthLabel: (month) => {
      const j = toJalali(month);
      return `${JALALI_MONTH_NAMES[j.jm - 1]} ${formatNumber(j.jy, latinDigits)}`;
    },
    formatDayOfMonth: (date) => formatNumber(toJalali(date).jd, latinDigits),
    getDateKey: (date) => date.toISOString().slice(0, 10),
    getWeekdayLabels: () => Array.from({ length: 7 }, (_, index) => JALALI_WEEKDAY_LABELS[((firstDayOfWeek + index - 6 + 7) % 7)]),
    createCalendarMonth: (month) => {
      const monthStart = adapter.startOfMonth(month);
      const gridStartOffset = (monthStart.getDay() - firstDayOfWeek + 7) % 7;
      const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - gridStartOffset);
      return Array.from({ length: 42 }, (_, index): CalendarDay => {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
        return { date, day: adapter.formatDayOfMonth(date), isCurrentMonth: adapter.isSameMonth(date, monthStart) };
      });
    },
    createMonthSequence: (startMonth, count) => Array.from({ length: count }, (_, monthOffset) => adapter.addMonths(startMonth, monthOffset)),
    isDateDisabled: (date, minDate, maxDate) => {
      const day = adapter.startOfDay(date);
      return Boolean((minDate && adapter.isBeforeDay(day, minDate)) || (maxDate && adapter.isBeforeDay(maxDate, day)));
    },
    canNavigateToMonth: (month, visibleMonthCount = 1, minDate, maxDate) => {
      const startMonth = adapter.startOfMonth(month);
      const endMonth = adapter.endOfMonth(adapter.addMonths(startMonth, Math.max(visibleMonthCount - 1, 0)));
      return Boolean((!minDate || !adapter.isBeforeDay(endMonth, minDate)) && (!maxDate || !adapter.isBeforeDay(maxDate, startMonth)));
    },
    canNavigateMonth: (month, amount, visibleMonthCount = 1, minDate, maxDate) => adapter.canNavigateToMonth(adapter.addMonths(month, amount), visibleMonthCount, minDate, maxDate),
    constrainMonth: (month, visibleMonthCount = 1, minDate, maxDate) => {
      if (adapter.canNavigateToMonth(month, visibleMonthCount, minDate, maxDate)) return month;
      if (minDate && adapter.isBeforeDay(adapter.endOfMonth(adapter.addMonths(month, Math.max(visibleMonthCount - 1, 0))), minDate)) return adapter.startOfMonth(minDate);
      if (maxDate && adapter.isBeforeDay(maxDate, adapter.startOfMonth(month))) return adapter.startOfMonth(maxDate);
      return month;
    },
    parseDate: (value) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) return null;
      const jy = Number(match[1]);
      const jm = Number(match[2]);
      const jd = Number(match[3]);
      if (jm < 1 || jm > 12 || jd < 1 || jd > getJalaliMonthLength(jy, jm)) return null;
      return newJalaliDate(jy, jm, jd);
    },
  };

  return adapter;
}

export const jalaliCalendarAdapter = createJalaliCalendarAdapter();
