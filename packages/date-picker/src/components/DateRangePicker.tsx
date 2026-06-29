import { useState } from 'react';
import { Calendar } from './Calendar';
import { formatInputDate, isBetweenDays, isSameDay } from '../core/dateUtils';
import { DateRangeValue, selectDateRangeDate } from '../core/selection';
import '../styles.css';

export function DateRangePicker() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedRange, setSelectedRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

  return (
    <div className="adp-picker">
      <Calendar
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        onDateSelect={(date) => setSelectedRange((currentRange) => selectDateRangeDate(currentRange, date))}
        getDayState={(date) => ({
          selected: isSameDay(date, selectedRange.startDate) || isSameDay(date, selectedRange.endDate),
          inRange: isBetweenDays(date, selectedRange.startDate, selectedRange.endDate),
          rangeStart: isSameDay(date, selectedRange.startDate),
          rangeEnd: isSameDay(date, selectedRange.endDate),
        })}
      />
      <div className="adp-selection-label">
        Selected range: {formatInputDate(selectedRange.startDate) || 'Start'} → {formatInputDate(selectedRange.endDate) || 'End'}
      </div>
    </div>
  );
}
