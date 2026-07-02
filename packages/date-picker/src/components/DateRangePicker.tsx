import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Calendar, type RenderCalendarDay } from './Calendar';
import { PickerField, type PickerDisplayMode } from './PickerField';
import { type CalendarAdapter, useCalendarAdapter } from '../core/calendarAdapter';
import { type DateRangeValue, selectDateRangeDate } from '../core/selection';
import '../styles.css';

export type DateRangePickerProps = {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  onChange?: (range: DateRangeValue | null) => void;
  renderDay?: RenderCalendarDay;
  minDate?: Date;
  maxDate?: Date;
  viewMode?: 'infinite' | 'single';
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
  startName?: string;
  endName?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  placeholder?: string;
  calendarLabel?: string;
  numberOfMonths?: number;
  mobileMonthCount?: number;
  formatValue?: (range: DateRangeValue, adapter: CalendarAdapter) => string;
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

const emptyRange: DateRangeValue = {
  startDate: null,
  endDate: null,
};

function normalizeRange(range: DateRangeValue | null | undefined): DateRangeValue {
  return range ?? emptyRange;
}

function formatRange(range: DateRangeValue, adapter: CalendarAdapter) {
  const start = adapter.formatInputDate(range.startDate);
  const end = adapter.formatInputDate(range.endDate);

  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – …`;

  return '';
}

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

export function DateRangePicker({
  value,
  defaultValue = null,
  onChange,
  renderDay,
  minDate,
  maxDate,
  viewMode = 'single',
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
  startName,
  endName,
  label,
  helperText,
  errorText,
  placeholder = 'Select date range',
  calendarLabel = 'Choose date range',
  numberOfMonths = 2,
  mobileMonthCount,
  formatValue,
  inputProps,
}: DateRangePickerProps = {}) {
  const adapter = useCalendarAdapter();
  const generatedCalendarId = useId();
  const calendarId = `adp-range-calendar-${generatedCalendarId}`;
  const initialRange = normalizeRange(value ?? defaultValue);
  const [visibleMonthStart, setVisibleMonthStart] = useState(() => initialRange.startDate ?? adapter.today());
  const [uncontrolledSelectedRange, setUncontrolledSelectedRange] = useState<DateRangeValue>(initialRange);
  const [isOpen, setOpen] = useControllableOpen({ open, defaultOpen, onOpenChange });
  const isControlled = value !== undefined;
  const selectedRange = isControlled ? normalizeRange(value) : uncontrolledSelectedRange;
  const safeNumberOfMonths = Math.max(1, Math.trunc(numberOfMonths));
  const isInteractionDisabled = disabled || readOnly;
  const constrainedVisibleMonthStart = adapter.constrainMonth(visibleMonthStart, safeNumberOfMonths, minDate, maxDate);
  const desktopVisibleMonths = adapter.createMonthSequence(constrainedVisibleMonthStart, safeNumberOfMonths);
  const resolvedMobileMonthCount = viewMode === 'infinite'
    ? Math.max(1, Math.trunc(mobileMonthCount ?? 6))
    : 1;
  const mobileVisibleMonths = adapter.createMonthSequence(constrainedVisibleMonthStart, resolvedMobileMonthCount);
  const canNavigateDesktopPrev = !isInteractionDisabled && adapter.canNavigateMonth(constrainedVisibleMonthStart, -1, safeNumberOfMonths, minDate, maxDate);
  const canNavigateDesktopNext = !isInteractionDisabled && adapter.canNavigateMonth(constrainedVisibleMonthStart, 1, safeNumberOfMonths, minDate, maxDate);
  const canNavigateMobilePrev = !isInteractionDisabled && adapter.canNavigateMonth(constrainedVisibleMonthStart, -1, resolvedMobileMonthCount, minDate, maxDate);
  const canNavigateMobileNext = !isInteractionDisabled && adapter.canNavigateMonth(constrainedVisibleMonthStart, 1, resolvedMobileMonthCount, minDate, maxDate);
  const valueText = formatValue ? formatValue(selectedRange, adapter) : formatRange(selectedRange, adapter);
  const startDateKey = selectedRange.startDate ? adapter.getDateKey(selectedRange.startDate) : null;

  useEffect(() => {
    if (selectedRange.startDate) {
      setVisibleMonthStart(selectedRange.startDate);
    }
  }, [startDateKey]);

  const setConstrainedVisibleMonthStart = (month: Date, visibleMonthCount = safeNumberOfMonths) => {
    setVisibleMonthStart(adapter.constrainMonth(month, visibleMonthCount, minDate, maxDate));
  };

  const getRangeDayState = (date: Date) => ({
    selected: adapter.isSameDay(date, selectedRange.startDate) || adapter.isSameDay(date, selectedRange.endDate),
    inRange: adapter.isBetweenDays(date, selectedRange.startDate, selectedRange.endDate),
    rangeStart: adapter.isSameDay(date, selectedRange.startDate),
    rangeEnd: adapter.isSameDay(date, selectedRange.endDate),
  });

  const selectRangeDate = (date: Date) => {
    if (isInteractionDisabled || adapter.isDateDisabled(date, minDate, maxDate)) {
      return;
    }

    const nextRange = selectDateRangeDate(selectedRange, date, adapter);

    if (!isControlled) {
      setUncontrolledSelectedRange(nextRange);
    }

    onChange?.(nextRange);

    if (closeOnSelect && displayMode === 'popover' && nextRange.startDate && nextRange.endDate) {
      setOpen(false);
    }
  };

  const clearRange = () => {
    if (isInteractionDisabled) {
      return;
    }

    if (!isControlled) {
      setUncontrolledSelectedRange(emptyRange);
    }

    onChange?.(null);
  };

  const renderCalendar = (month: Date, index: number, count: number, mode: 'desktop' | 'mobile') => {
    const isFirst = index === 0;
    const isLast = index === count - 1;
    const monthCount = mode === 'desktop' ? safeNumberOfMonths : resolvedMobileMonthCount;
    const canNavigatePrev = mode === 'desktop' ? canNavigateDesktopPrev : canNavigateMobilePrev;
    const canNavigateNext = mode === 'desktop' ? canNavigateDesktopNext : canNavigateMobileNext;

    return (
      <Calendar
        key={adapter.getDateKey(month)}
        id={isFirst ? calendarId : undefined}
        month={month}
        onMonthChange={(nextMonth) => setConstrainedVisibleMonthStart(nextMonth, monthCount)}
        onDateSelect={selectRangeDate}
        getDayState={getRangeDayState}
        showNavigation={mode === 'mobile' && viewMode === 'single'}
        isDateDisabled={(date) => isInteractionDisabled || adapter.isDateDisabled(date, minDate, maxDate)}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        renderDay={renderDay}
        ariaLabel={`${calendarLabel}: ${adapter.formatMonthLabel(month)}`}
        headerStart={mode === 'desktop' && isFirst ? (
          <button
            type="button"
            className="adp-nav-button adp-range-nav-button"
            onClick={() => canNavigatePrev && setConstrainedVisibleMonthStart(adapter.addMonths(constrainedVisibleMonthStart, -1), monthCount)}
            disabled={!canNavigatePrev}
            aria-label="Previous month"
          >
            ‹
          </button>
        ) : undefined}
        headerEnd={mode === 'desktop' && isLast ? (
          <button
            type="button"
            className="adp-nav-button adp-range-nav-button"
            onClick={() => canNavigateNext && setConstrainedVisibleMonthStart(adapter.addMonths(constrainedVisibleMonthStart, 1), monthCount)}
            disabled={!canNavigateNext}
            aria-label="Next month"
          >
            ›
          </button>
        ) : undefined}
      />
    );
  };

  const calendars = (
    <>
      <div className="adp-range-calendars adp-range-calendars-desktop">
        <div className="adp-range-calendar-surface">
          {desktopVisibleMonths.map((month, index) => renderCalendar(month, index, desktopVisibleMonths.length, 'desktop'))}
        </div>
      </div>
      <div className="adp-range-calendars-mobile">
        {mobileVisibleMonths.map((month, index) => renderCalendar(month, index, mobileVisibleMonths.length, 'mobile'))}
      </div>
    </>
  );

  if (displayMode === 'inline') {
    return (
      <div dir={adapter.direction} className="adp-picker adp-picker-inline">
        {calendars}
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
        onClear={clearRange}
        clearable={clearable}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        direction={adapter.direction}
        calendarId={calendarId}
        popoverLabel={calendarLabel}
        hiddenFields={[
          ...(startName ? [{ name: startName, value: adapter.formatInputDate(selectedRange.startDate) }] : []),
          ...(endName ? [{ name: endName, value: adapter.formatInputDate(selectedRange.endDate) }] : []),
        ]}
        inputProps={inputProps}
      >
        {calendars}
      </PickerField>
    </div>
  );
}
