import { memo, type ReactNode } from 'react';
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
  tabIndex: number;
  role: 'gridcell';
  'aria-selected': boolean;
  'aria-disabled': boolean;
};

export type RenderCalendarDay = (dayProps: CalendarRenderDayProps) => ReactNode;

type CalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: Date) => void;
  getDayState: (date: Date) => CalendarDayState;
  showNavigation?: boolean;
  renderDay?: RenderCalendarDay;
};

type DayCellProps = {
  dayProps: CalendarRenderDayProps;
  className: string;
  renderDay?: RenderCalendarDay;
};

const DayCell = memo(function DayCell({ dayProps, className, renderDay }: DayCellProps) {
  const content = renderDay ? renderDay(dayProps) : dayProps.isOutsideMonth ? null : dayProps.label;

  return (
    <button
      type="button"
      className={className}
      onClick={dayProps.onClick}
      onMouseEnter={dayProps.onMouseEnter}
      onFocus={dayProps.onFocus}
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

export function Calendar({ month, onMonthChange, onDateSelect, getDayState, showNavigation = true, renderDay }: CalendarProps) {
  const adapter = useCalendarAdapter();
  const days = adapter.createCalendarMonth(month);
  const weekdayLabels = adapter.getWeekdayLabels();
  const today = adapter.today();

  return (
    <div className="adp-date-picker" dir={adapter.direction}>
      <div className={`adp-calendar-header${showNavigation ? '' : ' adp-calendar-header-centered'}`}>
        {showNavigation ? (
          <button type="button" className="adp-nav-button" onClick={() => onMonthChange(adapter.addMonths(month, -1))} aria-label="Previous month">
            ‹
          </button>
        ) : null}
        <div className="adp-month-label">{adapter.formatMonthLabel(month)}</div>
        {showNavigation ? (
          <button type="button" className="adp-nav-button" onClick={() => onMonthChange(adapter.addMonths(month, 1))} aria-label="Next month">
            ›
          </button>
        ) : null}
      </div>

      <div className="adp-calendar-grid adp-weekdays">
        {weekdayLabels.map((day) => (
          <div key={day} className="adp-weekday">{day}</div>
        ))}
      </div>

      <div className="adp-calendar-grid" role="grid">
        {days.map((calendarDay) => {
          const isOutsideMonth = !calendarDay.isCurrentMonth;
          const dayState = isOutsideMonth ? {} : getDayState(calendarDay.date);
          const isDisabled = isOutsideMonth;
          const className = [
            'adp-day',
            isOutsideMonth ? 'adp-day-placeholder' : '',
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
            isToday: adapter.isSameDay(calendarDay.date, today),
            isSelected: Boolean(dayState.selected),
            isInRange: Boolean(dayState.inRange),
            isRangeStart: Boolean(dayState.rangeStart),
            isRangeEnd: Boolean(dayState.rangeEnd),
            isOutsideMonth,
            isDisabled,
            label: calendarDay.day,
            onClick: () => {
              if (!isDisabled) {
                onDateSelect(calendarDay.date);
              }
            },
            tabIndex: isDisabled ? -1 : 0,
            role: 'gridcell',
            'aria-selected': Boolean(dayState.selected),
            'aria-disabled': isDisabled,
          };

          return <DayCell key={adapter.getDateKey(calendarDay.date)} dayProps={dayProps} className={className} renderDay={renderDay} />;
        })}
      </div>
    </div>
  );
}
