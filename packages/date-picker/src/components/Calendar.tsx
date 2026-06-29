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
          const dayState = getDayState(calendarDay.date);
          const className = [
            'adp-day',
            !calendarDay.isCurrentMonth ? 'adp-day-muted' : '',
            dayState.selected ? 'adp-day-selected' : '',
            dayState.inRange ? 'adp-day-in-range' : '',
            dayState.rangeStart ? 'adp-day-range-start' : '',
            dayState.rangeEnd ? 'adp-day-range-end' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={calendarDay.date.toISOString()}
              type="button"
              className={className}
              onClick={() => onDateSelect(calendarDay.date)}
            >
              {calendarDay.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
