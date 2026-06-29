import { useState } from 'react';
import { Calendar } from './Calendar';
import { useCalendarAdapter } from '../core/calendarAdapter';
import { DateRangeValue, selectDateRangeDate } from '../core/selection';
import '../styles.css';

export function DateRangePicker() {
  const adapter = useCalendarAdapter();
  const [visibleMonthStart, setVisibleMonthStart] = useState(() => adapter.today());
  const [selectedRange, setSelectedRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

  const visibleMonthEnd = adapter.addMonths(visibleMonthStart, 1);
  const mobileVisibleMonths = Array.from({ length: 9 }, (_, monthOffset) => adapter.addMonths(visibleMonthStart, monthOffset));

  const getRangeDayState = (date: Date) => ({
    selected: adapter.isSameDay(date, selectedRange.startDate) || adapter.isSameDay(date, selectedRange.endDate),
    inRange: adapter.isBetweenDays(date, selectedRange.startDate, selectedRange.endDate),
    rangeStart: adapter.isSameDay(date, selectedRange.startDate),
    rangeEnd: adapter.isSameDay(date, selectedRange.endDate),
  });

  const selectRangeDate = (date: Date) => setSelectedRange((currentRange) => selectDateRangeDate(currentRange, date, adapter));

  return (
    <div className="adp-picker">
      <div className="adp-range-calendars adp-range-calendars-desktop">
        <button
          type="button"
          className="adp-nav-button adp-range-nav-button"
          onClick={() => setVisibleMonthStart((currentMonth) => adapter.addMonths(currentMonth, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <Calendar
          month={visibleMonthStart}
          onMonthChange={setVisibleMonthStart}
          onDateSelect={selectRangeDate}
          getDayState={getRangeDayState}
          showNavigation={false}
        />
        <Calendar
          month={visibleMonthEnd}
          onMonthChange={setVisibleMonthStart}
          onDateSelect={selectRangeDate}
          getDayState={getRangeDayState}
          showNavigation={false}
        />
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
            key={month.toISOString()}
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
