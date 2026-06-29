import { useState } from 'react';
import { Calendar } from './Calendar';
import { formatInputDate, isSameDay } from '../core/dateUtils';
import { selectSingleDate } from '../core/selection';
import '../styles.css';

export function DatePicker() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="adp-picker">
      <Calendar
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        onDateSelect={(date) => setSelectedDate(selectSingleDate(date))}
        getDayState={(date) => ({ selected: isSameDay(date, selectedDate) })}
      />
      <div className="adp-selection-label">Selected date: {formatInputDate(selectedDate) || 'None'}</div>
    </div>
  );
}
