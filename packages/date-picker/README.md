# Aryan Date Picker

A business-ready React date picker with Gregorian and Jalali calendar adapters. It ships as a small component library, keeps values as standard JavaScript `Date` objects, and now includes the product pieces most apps need: input fields, popovers, clear actions, validation copy, min/max rules, RTL support, and inline calendar mode.

## Installation

```sh
pnpm add aryan-date-picker
```

```sh
npm install aryan-date-picker
```

Import the stylesheet once in your app:

```tsx
import 'aryan-date-picker/styles.css';
```

## Basic usage

`DatePicker` and `DateRangePicker` render as form fields with popover calendars by default.

```tsx
import { useState } from 'react';
import { DatePicker, DateRangePicker, type DateRangeValue } from 'aryan-date-picker';
import 'aryan-date-picker/styles.css';

export function BookingForm() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [stay, setStay] = useState<DateRangeValue | null>(null);

  return (
    <form>
      <DatePicker
        label="Check-in"
        name="checkIn"
        value={checkIn}
        onChange={setCheckIn}
        minDate={new Date()}
        helperText="Pick the first available night."
      />

      <DateRangePicker
        label="Stay dates"
        name="stayDates"
        startName="stayStart"
        endName="stayEnd"
        value={stay}
        onChange={setStay}
        minDate={new Date()}
      />
    </form>
  );
}
```

Use `displayMode="inline"` when the calendar should always be visible.

```tsx
<DatePicker displayMode="inline" />
<DateRangePicker displayMode="inline" numberOfMonths={2} />
```

## Public API

```tsx
import {
  DatePicker,
  DateRangePicker,
  LocalizationProvider,
  createGregorianCalendarAdapter,
  createJalaliCalendarAdapter,
  defaultCalendarAdapter,
  jalaliCalendarAdapter,
  useCalendarAdapter,
  type CalendarAdapter,
  type CalendarDay,
  type CalendarRenderDayProps,
  type DatePickerProps,
  type DateRangePickerProps,
  type DateRangeValue,
  type GregorianCalendarAdapterOptions,
  type JalaliCalendarAdapterOptions,
  type LayoutDirection,
  type LocalizationProviderProps,
  type PickerDisplayMode,
  type RenderCalendarDay,
} from 'aryan-date-picker';
```

The low-level `Calendar` component remains internal. Consumers should import from the package root.

## Component props

### `DatePickerProps`

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `Date \| null` | Controlled selected date. |
| `defaultValue` | `Date \| null` | Initial date for uncontrolled usage. |
| `onChange` | `(date: Date \| null) => void` | Called when the selected date changes or is cleared. |
| `displayMode` | `'popover' \| 'inline'` | Field + popover by default; inline keeps the calendar visible. |
| `open` / `defaultOpen` | `boolean` | Controlled or uncontrolled popover state. |
| `onOpenChange` | `(open: boolean) => void` | Called when popover visibility changes. |
| `closeOnSelect` | `boolean` | Closes the popover after selection. Defaults to `true`. |
| `clearable` | `boolean` | Shows a clear action when a value exists. Defaults to `true`. |
| `disabled` / `readOnly` / `required` | `boolean` | Standard form states. |
| `id` / `name` | `string` | Form field identifiers. |
| `label` | `ReactNode` | Visible field label. |
| `helperText` | `ReactNode` | Supporting text below the input. |
| `errorText` | `ReactNode` | Error text below the input and `aria-invalid`. |
| `placeholder` | `string` | Empty input placeholder. |
| `calendarLabel` | `string` | Accessible label for the calendar dialog/grid. |
| `formatValue` | `(date, adapter) => string` | Custom field display formatter. |
| `inputProps` | `InputHTMLAttributes<HTMLInputElement>` | Additional input attributes, excluding controlled internals. |
| `renderDay` | `RenderCalendarDay` | Custom renderer for day-cell contents. |
| `minDate` / `maxDate` | `Date` | Selectable date and navigation boundaries. |

### `DateRangePickerProps`

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `DateRangeValue \| null` | Controlled selected range. |
| `defaultValue` | `DateRangeValue \| null` | Initial range for uncontrolled usage. |
| `onChange` | `(range: DateRangeValue \| null) => void` | Called when the range changes or is cleared. |
| `displayMode` | `'popover' \| 'inline'` | Field + popover by default; inline keeps calendars visible. |
| `open` / `defaultOpen` | `boolean` | Controlled or uncontrolled popover state. |
| `onOpenChange` | `(open: boolean) => void` | Called when popover visibility changes. |
| `closeOnSelect` | `boolean` | Closes the popover once start and end are selected. Defaults to `true`. |
| `name` | `string` | Combined visible field name. |
| `startName` / `endName` | `string` | Optional hidden inputs for start and end values. |
| `numberOfMonths` | `number` | Desktop month count. Defaults to `2`. |
| `viewMode` | `'single' \| 'infinite'` | Mobile strategy. Defaults to `'single'`. |
| `mobileMonthCount` | `number` | Month count for mobile infinite mode. Defaults to `6`. |
| `formatValue` | `(range, adapter) => string` | Custom field display formatter. |
| `clearable`, `disabled`, `readOnly`, `required`, `label`, `helperText`, `errorText`, `placeholder`, `calendarLabel`, `inputProps`, `renderDay`, `minDate`, `maxDate` | See `DatePickerProps` | Same behavior for range selection. |

```ts
export type DateRangeValue = {
  startDate: Date | null;
  endDate: Date | null;
};
```

## Controlled and uncontrolled values

Both pickers support standard React controlled and uncontrolled patterns.

```tsx
<DatePicker value={selectedDate} onChange={setSelectedDate} />
<DatePicker defaultValue={new Date()} />

<DateRangePicker value={selectedRange} onChange={setSelectedRange} />
<DateRangePicker defaultValue={{ startDate: new Date(), endDate: null }} />
```

Popover state can also be controlled when product flows need explicit control.

```tsx
<DatePicker open={isCalendarOpen} onOpenChange={setCalendarOpen} />
```

## Date constraints

Use `minDate` and `maxDate` to limit selectable dates and calendar navigation. Dates outside the range are rendered as disabled, cannot be selected, and navigation arrows stop at the first or last month that can contain valid dates.

```tsx
const minDate = new Date(2026, 6, 10);
const maxDate = new Date(2026, 8, 20);

<DatePicker minDate={minDate} maxDate={maxDate} />
<DateRangePicker minDate={minDate} maxDate={maxDate} />
```

## Keyboard and accessibility

Calendar grids use one active tabbable day. Arrow keys move by day or week, and Page Up/Page Down changes the visible month. Popovers close on outside click or Escape. Field labels, helper text, error text, `aria-invalid`, `aria-controls`, and `aria-expanded` are wired into the field shell.

## Custom day rendering

Use `renderDay` to customize each day while keeping selection, range calculation, disabled state, keyboard behavior, and accessibility attributes owned by the picker.

```tsx
import { DatePicker, type CalendarRenderDayProps } from 'aryan-date-picker';

const prices: Record<string, number> = {
  '2026-07-14': 129,
};

function BookingDay(day: CalendarRenderDayProps) {
  const key = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
  const price = prices[key];

  return (
    <span className={day.isSelected ? 'selected-booking-day' : undefined}>
      <span>{day.label}</span>
      {price ? <small>${price}</small> : null}
    </span>
  );
}

export function BookingCalendar() {
  return <DatePicker renderDay={BookingDay} />;
}
```

## LocalizationProvider

`LocalizationProvider` places a calendar adapter in React context. Components below the provider use that adapter for formatting, parsing, month grids, navigation, comparisons, and direction.

```tsx
import {
  DatePicker,
  LocalizationProvider,
  createGregorianCalendarAdapter,
} from 'aryan-date-picker';

const gregorianAdapter = createGregorianCalendarAdapter({ locale: 'en-US' });

export function GregorianExample() {
  return (
    <LocalizationProvider adapter={gregorianAdapter}>
      <DatePicker />
    </LocalizationProvider>
  );
}
```

If no adapter is provided, the library uses the default Gregorian adapter.

## Jalali calendar

The Jalali adapter renders Persian month names, weekday labels, Jalali month grids, Jalali month arithmetic, parsing, and leap-year-aware Esfand length. It exposes `direction: 'rtl'`, so fields and popovers automatically flip direction.

```tsx
import { DatePicker, LocalizationProvider, createJalaliCalendarAdapter } from 'aryan-date-picker';

const jalaliAdapter = createJalaliCalendarAdapter();

export function JalaliExample() {
  return (
    <LocalizationProvider adapter={jalaliAdapter}>
      <DatePicker label="تاریخ" placeholder="انتخاب تاریخ" />
    </LocalizationProvider>
  );
}
```

Parsing and labels use Jalali dates, but selected values are still JavaScript `Date` objects:

```tsx
const adapter = createJalaliCalendarAdapter();
const date: Date | null = adapter.parseDate('1403-12-30');
```

## Building custom adapters

Implement the `CalendarAdapter` interface and pass it to `LocalizationProvider`. A custom adapter owns calendar interpretation, month names, weekday labels, month grids, date math, comparisons, formatting, parsing, min/max helpers, and layout direction.

```tsx
import { LocalizationProvider, DatePicker, type CalendarAdapter } from 'aryan-date-picker';

const customAdapter: CalendarAdapter = {
  // Implement the full adapter contract.
};

export function CustomCalendarExample() {
  return (
    <LocalizationProvider adapter={customAdapter}>
      <DatePicker />
    </LocalizationProvider>
  );
}
```

## Migration notes for 0.2.0

- The default `displayMode` changed to `'popover'`, because the package is now positioned as a full date-picker field instead of only an inline calendar widget.
- Existing always-visible calendars should pass `displayMode="inline"`.
- `DateRangePicker` mobile default changed from long infinite scrolling to one month with navigation. Use `viewMode="infinite"` to restore the old multi-month stack.
- `CalendarAdapter` now includes `addDays`, used for keyboard navigation.
