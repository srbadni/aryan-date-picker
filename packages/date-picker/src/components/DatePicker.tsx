import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Calendar, type RenderCalendarDay } from './Calendar';
import { PickerField, type PickerDisplayMode } from './PickerField';
import { type CalendarAdapter, useCalendarAdapter } from '../core/calendarAdapter';
import { selectSingleDate } from '../core/selection';
import '../styles.css';

export type DatePickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  renderDay?: RenderCalendarDay;
  minDate?: Date;
  maxDate?: Date;
  displayMode?: PickerDisplayMode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  placeholder?: string;
  calendarLabel?: string;
  formatValue?: (date: Date | null, adapter: CalendarAdapter) => string;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'readOnly'
    | 'disabled'
    | 'required'
    | 'dir'
    | 'id'
    | 'name'
    | 'placeholder'
  >;
};

function useControllableOpen({
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpenControlled = open !== undefined;
  const currentOpen = isOpenControlled ? open : uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isOpenControlled) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  return [currentOpen, setOpen] as const;
}

export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  renderDay,
  minDate,
  maxDate,
  displayMode = 'popover',
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect = true,
  clearable = true,
  disabled = false,
  readOnly = false,
  required = false,
  id,
  name,
  label,
  helperText,
  errorText,
  placeholder = 'Select date',
  calendarLabel = 'Choose date',
  formatValue,
  inputProps,
}: DatePickerProps = {}) {
  const adapter = useCalendarAdapter();
  const generatedCalendarId = useId();
  const calendarId = `adp-calendar-${generatedCalendarId}`;
  const [visibleMonth, setVisibleMonth] = useState(() => value ?? defaultValue ?? adapter.today());
  const [uncontrolledSelectedDate, setUncontrolledSelectedDate] = useState<Date | null>(defaultValue);
  const [isOpen, setOpen] = useControllableOpen({ open, defaultOpen, onOpenChange });
  const isControlled = value !== undefined;
  const selectedDate = isControlled ? value : uncontrolledSelectedDate;
  const constrainedVisibleMonth = adapter.constrainMonth(visibleMonth, 1, minDate, maxDate);
  const isInteractionDisabled = disabled || readOnly;
  const valueText = formatValue ? formatValue(selectedDate ?? null, adapter) : adapter.formatInputDate(selectedDate ?? null);

  const selectedDateKey = selectedDate ? adapter.getDateKey(selectedDate) : null;

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
    }
  }, [selectedDateKey]);

  const selectDate = (date: Date) => {
    if (isInteractionDisabled || adapter.isDateDisabled(date, minDate, maxDate)) {
      return;
    }

    const nextDate = selectSingleDate(date);

    if (!isControlled) {
      setUncontrolledSelectedDate(nextDate);
    }

    onChange?.(nextDate);

    if (closeOnSelect && displayMode === 'popover') {
      setOpen(false);
    }
  };

  const clearDate = () => {
    if (isInteractionDisabled) {
      return;
    }

    if (!isControlled) {
      setUncontrolledSelectedDate(null);
    }

    onChange?.(null);
  };

  const calendar = (
    <Calendar
      id={calendarId}
      month={constrainedVisibleMonth}
      onMonthChange={(month) => setVisibleMonth(adapter.constrainMonth(month, 1, minDate, maxDate))}
      onDateSelect={selectDate}
      getDayState={(date) => ({ selected: adapter.isSameDay(date, selectedDate ?? null) })}
      isDateDisabled={(date) => isInteractionDisabled || adapter.isDateDisabled(date, minDate, maxDate)}
      canNavigatePrev={!isInteractionDisabled && adapter.canNavigateMonth(constrainedVisibleMonth, -1, 1, minDate, maxDate)}
      canNavigateNext={!isInteractionDisabled && adapter.canNavigateMonth(constrainedVisibleMonth, 1, 1, minDate, maxDate)}
      renderDay={renderDay}
      ariaLabel={calendarLabel}
    />
  );

  if (displayMode === 'inline') {
    return (
      <div dir={adapter.direction} className="adp-picker adp-picker-inline">
        {calendar}
      </div>
    );
  }

  return (
    <div dir={adapter.direction} className="adp-picker">
      <PickerField
        id={id}
        name={name}
        label={label}
        helperText={helperText}
        errorText={errorText}
        placeholder={placeholder}
        valueText={valueText}
        open={isOpen}
        onOpenChange={setOpen}
        onClear={clearDate}
        clearable={clearable}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        direction={adapter.direction}
        calendarId={calendarId}
        popoverLabel={calendarLabel}
        inputProps={inputProps}
      >
        {calendar}
      </PickerField>
    </div>
  );
}
