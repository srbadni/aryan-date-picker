import { addMonths, createCalendarMonth, getMonthLabel, WEEKDAY_LABELS } from '../core/calendar';

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
};

export function Calendar({ month, onMonthChange, onDateSelect, getDayState }: CalendarProps) {
  const days = createCalendarMonth(month);

  return (
    <div className="adp-date-picker">
      <div className="adp-calendar-header">
        <button type="button" className="adp-nav-button" onClick={() => onMonthChange(addMonths(month, -1))} aria-label="Previous month">
          ‹
        </button>
        <div className="adp-month-label">{getMonthLabel(month)}</div>
        <button type="button" className="adp-nav-button" onClick={() => onMonthChange(addMonths(month, 1))} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="adp-calendar-grid adp-weekdays">
        {WEEKDAY_LABELS.map((day) => (
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
