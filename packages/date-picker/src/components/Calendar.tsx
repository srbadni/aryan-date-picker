import { useCalendarAdapter } from '../core/calendarAdapter';

export type CalendarDayState = {
  selected?: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
};

type CalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: Date) => void;
  getDayState: (date: Date) => CalendarDayState;
  showNavigation?: boolean;
};

export function Calendar({ month, onMonthChange, onDateSelect, getDayState, showNavigation = true }: CalendarProps) {
  const adapter = useCalendarAdapter();
  const days = adapter.createCalendarMonth(month);
  const weekdayLabels = adapter.getWeekdayLabels();

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

      <div className="adp-calendar-grid">
        {days.map((calendarDay) => {
          const isPlaceholderDay = !calendarDay.isCurrentMonth;
          const dayState = isPlaceholderDay ? {} : getDayState(calendarDay.date);
          const className = [
            'adp-day',
            isPlaceholderDay ? 'adp-day-placeholder' : '',
            dayState.selected ? 'adp-day-selected' : '',
            dayState.inRange ? 'adp-day-in-range' : '',
            dayState.rangeStart ? 'adp-day-range-start' : '',
            dayState.rangeEnd ? 'adp-day-range-end' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={adapter.getDateKey(calendarDay.date)}
              type="button"
              className={className}
              onClick={() => onDateSelect(calendarDay.date)}
              disabled={isPlaceholderDay}
              aria-hidden={isPlaceholderDay}
              tabIndex={isPlaceholderDay ? -1 : undefined}
            >
              {isPlaceholderDay ? null : calendarDay.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
