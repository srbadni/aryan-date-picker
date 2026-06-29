import { useState } from 'react';
import { Calendar } from './Calendar';
import { useCalendarAdapter } from '../core/calendarAdapter';
import { selectSingleDate } from '../core/selection';
import '../styles.css';

export function DatePicker() {
  const adapter = useCalendarAdapter();
  const [visibleMonth, setVisibleMonth] = useState(() => adapter.today());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div style={{direction: adapter.direction}} className="adp-picker">
      <Calendar
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        onDateSelect={(date) => setSelectedDate(selectSingleDate(date))}
        getDayState={(date) => ({ selected: adapter.isSameDay(date, selectedDate) })}
      />
      <div className="adp-selection-label">Selected date: {adapter.formatInputDate(selectedDate) || 'None'}</div>
    </div>
  );
}
