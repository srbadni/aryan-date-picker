import { memo, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useCalendarAdapter } from '../core/calendarAdapter';

export type CalendarDayState = {
  selected?: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
};

export type CalendarRenderDayProps = {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  label: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex: number;
  role: 'gridcell';
  'aria-selected': boolean;
  'aria-disabled': boolean;
};

export type RenderCalendarDay = (dayProps: CalendarRenderDayProps) => ReactNode;

type CalendarProps = {
  id?: string;
  month: Date;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: Date) => void;
  getDayState: (date: Date) => CalendarDayState;
  showNavigation?: boolean;
  isDateDisabled?: (date: Date) => boolean;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  renderDay?: RenderCalendarDay;
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
  ariaLabel?: string;
};

type ComputedCalendarDay = {
  date: Date;
  key: string;
  label: string;
  isToday: boolean;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  dayState: CalendarDayState;
};

type DayCellProps = {
  dayProps: CalendarRenderDayProps;
  className: string;
  dateKey: string;
  renderDay?: RenderCalendarDay;
};

const DayCell = memo(function DayCell({ dayProps, className, dateKey, renderDay }: DayCellProps) {
  const content = renderDay ? renderDay(dayProps) : dayProps.isOutsideMonth ? null : dayProps.label;

  return (
    <button
      type="button"
      className={className}
      data-adp-date-key={dateKey}
      onClick={dayProps.onClick}
      onMouseEnter={dayProps.onMouseEnter}
      onFocus={dayProps.onFocus}
      onKeyDown={dayProps.onKeyDown}
      disabled={dayProps.isDisabled}
      aria-hidden={dayProps.isOutsideMonth}
      tabIndex={dayProps.tabIndex}
      role={dayProps.role}
      aria-selected={dayProps['aria-selected']}
      aria-disabled={dayProps['aria-disabled']}
    >
      {content}
    </button>
  );
});

function chunkWeeks(days: ComputedCalendarDay[]) {
  return Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) =>
    days.slice(weekIndex * 7, weekIndex * 7 + 7),
  );
}

export function Calendar({
  id,
  month,
  onMonthChange,
  onDateSelect,
  getDayState,
  showNavigation = true,
  isDateDisabled,
  canNavigatePrev = true,
  canNavigateNext = true,
  renderDay,
  headerStart,
  headerEnd,
  ariaLabel,
}: CalendarProps) {
  const adapter = useCalendarAdapter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const days = adapter.createCalendarMonth(month);
  const weekdayLabels = adapter.getWeekdayLabels();
  const today = adapter.today();
  const monthStart = adapter.startOfMonth(month);

  useEffect(() => {
    setFocusedDate(null);
  }, [adapter.getDateKey(monthStart)]);

  const computedDays = useMemo<ComputedCalendarDay[]>(() => (
    days.map((calendarDay) => {
      const isOutsideMonth = !calendarDay.isCurrentMonth;
      const dayState = isOutsideMonth ? {} : getDayState(calendarDay.date);
      const isDisabled = isOutsideMonth || Boolean(isDateDisabled?.(calendarDay.date));

      return {
        date: calendarDay.date,
        key: adapter.getDateKey(calendarDay.date),
        label: calendarDay.day,
        isToday: adapter.isSameDay(calendarDay.date, today),
        isOutsideMonth,
        isDisabled,
        dayState,
      };
    })
  ), [adapter, days, getDayState, isDateDisabled, today]);

  const focusableDays = computedDays.filter((day) => !day.isDisabled);
  const fallbackFocusedDay =
    focusableDays.find((day) => day.dayState.selected) ??
    focusableDays.find((day) => day.isToday) ??
    focusableDays[0];
  const activeFocusedKey =
    focusableDays.find((day) => focusedDate && adapter.isSameDay(day.date, focusedDate))?.key ??
    fallbackFocusedDay?.key;

  const focusByDate = (date: Date) => {
    const nextDate = adapter.startOfDay(date);
    const nextKey = adapter.getDateKey(nextDate);

    setFocusedDate(nextDate);

    if (!adapter.isSameMonth(nextDate, monthStart)) {
      onMonthChange(adapter.startOfMonth(nextDate));
    }

    window.requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLButtonElement>(`[data-adp-date-key="${nextKey}"]`)?.focus();
    });
  };

  const moveFocus = (currentDate: Date, amount: number) => {
    let nextDate = currentDate;

    for (let step = 0; step < 42; step += 1) {
      nextDate = adapter.addDays(nextDate, amount);

      if (!isDateDisabled?.(nextDate)) {
        focusByDate(nextDate);
        return;
      }
    }
  };

  const handleDayKeyDown = (date: Date) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const horizontalStep = adapter.direction === 'rtl' ? -1 : 1;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(date, horizontalStep);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(date, -horizontalStep);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(date, 7);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(date, -7);
        break;
      case 'PageDown':
        event.preventDefault();
        focusByDate(adapter.addMonths(date, 1));
        break;
      case 'PageUp':
        event.preventDefault();
        focusByDate(adapter.addMonths(date, -1));
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} id={id} className="adp-date-picker" dir={adapter.direction}>
      <div className={`adp-calendar-header${showNavigation || headerStart || headerEnd ? '' : ' adp-calendar-header-centered'}`}>
        {showNavigation ? (
          <button
            type="button"
            className="adp-nav-button"
            onClick={() => canNavigatePrev && onMonthChange(adapter.addMonths(month, -1))}
            disabled={!canNavigatePrev}
            aria-label="Previous month"
          >
            ‹
          </button>
        ) : headerStart ?? <span className="adp-calendar-header-spacer" aria-hidden="true" />}
        <div className="adp-month-label">{adapter.formatMonthLabel(month)}</div>
        {showNavigation ? (
          <button
            type="button"
            className="adp-nav-button"
            onClick={() => canNavigateNext && onMonthChange(adapter.addMonths(month, 1))}
            disabled={!canNavigateNext}
            aria-label="Next month"
          >
            ›
          </button>
        ) : headerEnd ?? <span className="adp-calendar-header-spacer" aria-hidden="true" />}
      </div>

      <div className="adp-calendar-grid adp-weekdays" role="row">
        {weekdayLabels.map((day) => (
          <div key={day} className="adp-weekday" role="columnheader">{day}</div>
        ))}
      </div>

      <div className="adp-calendar-grid" role="grid" aria-label={ariaLabel ?? adapter.formatMonthLabel(month)}>
        {chunkWeeks(computedDays).map((week, weekIndex) => (
          <div key={weekIndex} className="adp-calendar-row" role="row">
            {week.map((calendarDay) => {
              const { dayState, isDisabled, isOutsideMonth } = calendarDay;
              const className = [
                'adp-day',
                isOutsideMonth ? 'adp-day-placeholder' : '',
                isDisabled && !isOutsideMonth ? 'adp-day-disabled' : '',
                calendarDay.isToday && !isOutsideMonth ? 'adp-day-today' : '',
                dayState.selected ? 'adp-day-selected' : '',
                dayState.inRange ? 'adp-day-in-range' : '',
                dayState.rangeStart ? 'adp-day-range-start' : '',
                dayState.rangeEnd ? 'adp-day-range-end' : '',
                renderDay ? 'adp-day-custom' : '',
              ]
                .filter(Boolean)
                .join(' ');
              const dayProps: CalendarRenderDayProps = {
                date: calendarDay.date,
                isToday: calendarDay.isToday,
                isSelected: Boolean(dayState.selected),
                isInRange: Boolean(dayState.inRange),
                isRangeStart: Boolean(dayState.rangeStart),
                isRangeEnd: Boolean(dayState.rangeEnd),
                isOutsideMonth,
                isDisabled,
                label: calendarDay.label,
                onClick: () => {
                  if (!isDisabled) {
                    setFocusedDate(calendarDay.date);
                    onDateSelect(calendarDay.date);
                  }
                },
                onFocus: () => setFocusedDate(calendarDay.date),
                onKeyDown: handleDayKeyDown(calendarDay.date),
                tabIndex: calendarDay.key === activeFocusedKey ? 0 : -1,
                role: 'gridcell',
                'aria-selected': Boolean(dayState.selected),
                'aria-disabled': isDisabled,
              };

              return (
                <DayCell
                  key={calendarDay.key}
                  dateKey={calendarDay.key}
                  dayProps={dayProps}
                  className={className}
                  renderDay={renderDay}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
