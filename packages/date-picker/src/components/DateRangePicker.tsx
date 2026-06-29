import { useState } from 'react';
import { Calendar } from './Calendar';
import { useCalendarAdapter } from '../core/calendarAdapter';
import { DateRangeValue, selectDateRangeDate } from '../core/selection';
import '../styles.css';

export type DateRangePickerProps = {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (range: DateRangeValue | null) => void;
};

const emptyRange: DateRangeValue = {
  startDate: null,
  endDate: null,
};

function normalizeRange(range: DateRangeValue | null | undefined): DateRangeValue {
  return range ?? emptyRange;
}

export function DateRangePicker({ value, defaultValue = null, onChange }: DateRangePickerProps = {}) {
  const adapter = useCalendarAdapter();
  const initialRange = normalizeRange(value ?? defaultValue);
  const [visibleMonthStart, setVisibleMonthStart] = useState(() => initialRange.startDate ?? adapter.today());
  const [uncontrolledSelectedRange, setUncontrolledSelectedRange] = useState<DateRangeValue>(initialRange);
  const isControlled = value !== undefined;
  const selectedRange = isControlled ? normalizeRange(value) : uncontrolledSelectedRange;

  const desktopVisibleMonths = adapter.createMonthSequence(visibleMonthStart, 2);
  const mobileVisibleMonths = adapter.createMonthSequence(visibleMonthStart, 9);

  const getRangeDayState = (date: Date) => ({
    selected: adapter.isSameDay(date, selectedRange.startDate) || adapter.isSameDay(date, selectedRange.endDate),
    inRange: adapter.isBetweenDays(date, selectedRange.startDate, selectedRange.endDate),
    rangeStart: adapter.isSameDay(date, selectedRange.startDate),
    rangeEnd: adapter.isSameDay(date, selectedRange.endDate),
  });

  const selectRangeDate = (date: Date) => {
    const nextRange = selectDateRangeDate(selectedRange, date, adapter);

    if (!isControlled) {
      setUncontrolledSelectedRange(nextRange);
    }

    onChange?.(nextRange);
  };

  return (
    <div style={{direction: adapter.direction}} className="adp-picker">
      <div className="adp-range-calendars adp-range-calendars-desktop">
        <button
          type="button"
          className="adp-nav-button adp-range-nav-button"
          onClick={() => setVisibleMonthStart((currentMonth) => adapter.addMonths(currentMonth, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="adp-range-calendar-surface">
          <Calendar
            month={desktopVisibleMonths[0]}
            onMonthChange={setVisibleMonthStart}
            onDateSelect={selectRangeDate}
            getDayState={getRangeDayState}
            showNavigation={false}
          />
          <Calendar
            month={desktopVisibleMonths[1]}
            onMonthChange={setVisibleMonthStart}
            onDateSelect={selectRangeDate}
            getDayState={getRangeDayState}
            showNavigation={false}
          />
        </div>
        <button
          type="button"
          className="adp-nav-button adp-range-nav-button"
          onClick={() => setVisibleMonthStart((currentMonth) => adapter.addMonths(currentMonth, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="adp-range-calendars-mobile">
        {mobileVisibleMonths.map((month) => (
          <Calendar
            key={adapter.getDateKey(month)}
            month={month}
            onMonthChange={setVisibleMonthStart}
            onDateSelect={selectRangeDate}
            getDayState={getRangeDayState}
            showNavigation={false}
          />
        ))}
      </div>
      <div className="adp-selection-label">
        Selected range: {adapter.formatInputDate(selectedRange.startDate) || 'Start'} → {adapter.formatInputDate(selectedRange.endDate) || 'End'}
      </div>
    </div>
  );
}
