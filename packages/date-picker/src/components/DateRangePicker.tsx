import { useState } from 'react';
import { Calendar, type RenderCalendarDay } from './Calendar';
import { useCalendarAdapter } from '../core/calendarAdapter';
import { DateRangeValue, selectDateRangeDate } from '../core/selection';
import '../styles.css';

export type DateRangePickerProps = {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (range: DateRangeValue | null) => void;
  renderDay?: RenderCalendarDay;
  minDate?: Date;
  maxDate?: Date;
  viewMode?: 'infinite' | 'single';
};

const emptyRange: DateRangeValue = {
  startDate: null,
  endDate: null,
};

function normalizeRange(range: DateRangeValue | null | undefined): DateRangeValue {
  return range ?? emptyRange;
}

export function DateRangePicker({ value, defaultValue = null, onChange, renderDay, minDate, maxDate, viewMode = 'infinite' }: DateRangePickerProps = {}) {
  const adapter = useCalendarAdapter();
  const initialRange = normalizeRange(value ?? defaultValue);
  const [visibleMonthStart, setVisibleMonthStart] = useState(() => initialRange.startDate ?? adapter.today());
  const [uncontrolledSelectedRange, setUncontrolledSelectedRange] = useState<DateRangeValue>(initialRange);
  const isControlled = value !== undefined;
  const selectedRange = isControlled ? normalizeRange(value) : uncontrolledSelectedRange;

  const constrainedVisibleMonthStart = adapter.constrainMonth(visibleMonthStart, 1, minDate, maxDate);
  const desktopVisibleMonths = adapter.createMonthSequence(constrainedVisibleMonthStart, 2);
  const mobileMonthCount = viewMode === 'infinite' ? 9 : 1;
  const mobileVisibleMonths = adapter.createMonthSequence(constrainedVisibleMonthStart, mobileMonthCount);
  const setConstrainedVisibleMonthStart = (month: Date, visibleMonthCount = 1) => {
    setVisibleMonthStart(adapter.constrainMonth(month, visibleMonthCount, minDate, maxDate));
  };
  const canNavigateDesktopPrev = adapter.canNavigateMonth(constrainedVisibleMonthStart, -1, 2, minDate, maxDate);
  const canNavigateDesktopNext = adapter.canNavigateMonth(constrainedVisibleMonthStart, 1, 2, minDate, maxDate);
  const canNavigateMobilePrev = adapter.canNavigateMonth(constrainedVisibleMonthStart, -1, mobileMonthCount, minDate, maxDate);
  const canNavigateMobileNext = adapter.canNavigateMonth(constrainedVisibleMonthStart, 1, mobileMonthCount, minDate, maxDate);

  const getRangeDayState = (date: Date) => ({
    selected: adapter.isSameDay(date, selectedRange.startDate) || adapter.isSameDay(date, selectedRange.endDate),
    inRange: adapter.isBetweenDays(date, selectedRange.startDate, selectedRange.endDate),
    rangeStart: adapter.isSameDay(date, selectedRange.startDate),
    rangeEnd: adapter.isSameDay(date, selectedRange.endDate),
  });

  const selectRangeDate = (date: Date) => {
    if (adapter.isDateDisabled(date, minDate, maxDate)) {
      return;
    }

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
          onClick={() => canNavigateDesktopPrev && setConstrainedVisibleMonthStart(adapter.addMonths(constrainedVisibleMonthStart, -1), 2)}
          disabled={!canNavigateDesktopPrev}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="adp-range-calendar-surface">
          <Calendar
            month={desktopVisibleMonths[0]}
            onMonthChange={(month) => setConstrainedVisibleMonthStart(month, 2)}
            onDateSelect={selectRangeDate}
            getDayState={getRangeDayState}
            showNavigation={false}
            isDateDisabled={(date) => adapter.isDateDisabled(date, minDate, maxDate)}
            renderDay={renderDay}
          />
          <Calendar
            month={desktopVisibleMonths[1]}
            onMonthChange={(month) => setConstrainedVisibleMonthStart(month, 2)}
            onDateSelect={selectRangeDate}
            getDayState={getRangeDayState}
            showNavigation={false}
            isDateDisabled={(date) => adapter.isDateDisabled(date, minDate, maxDate)}
            renderDay={renderDay}
          />
        </div>
        <button
          type="button"
          className="adp-nav-button adp-range-nav-button"
          onClick={() => canNavigateDesktopNext && setConstrainedVisibleMonthStart(adapter.addMonths(constrainedVisibleMonthStart, 1), 2)}
          disabled={!canNavigateDesktopNext}
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
            onMonthChange={(nextMonth) => setConstrainedVisibleMonthStart(nextMonth, mobileMonthCount)}
            onDateSelect={selectRangeDate}
            getDayState={getRangeDayState}
            showNavigation={viewMode === 'single'}
            isDateDisabled={(date) => adapter.isDateDisabled(date, minDate, maxDate)}
            canNavigatePrev={canNavigateMobilePrev}
            canNavigateNext={canNavigateMobileNext}
            renderDay={renderDay}
          />
        ))}
      </div>
      <div className="adp-selection-label">
        Selected range: {adapter.formatInputDate(selectedRange.startDate) || 'Start'} → {adapter.formatInputDate(selectedRange.endDate) || 'End'}
      </div>
    </div>
  );
}
