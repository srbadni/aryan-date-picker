# Aryan Date Picker

A lightweight React date picker component library with calendar-aware localization adapters.

## Installation

```sh
pnpm add aryan-date-picker
```

## Basic usage

```tsx
import { useState } from 'react';
import { DatePicker } from 'aryan-date-picker';
import 'aryan-date-picker/styles.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return <DatePicker value={selectedDate} onChange={setSelectedDate} />;
}
```


## Controlled and uncontrolled values

`DatePicker` and `DateRangePicker` support the standard React controlled component pattern. Pass `value` and `onChange` when the selected value should be owned by your application state.

```tsx
import { useState } from 'react';
import { DatePicker, DateRangePicker, type DateRangeValue } from 'aryan-date-picker';

export function ControlledExample() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRangeValue | null>(null);

  return (
    <>
      <DatePicker value={selectedDate} onChange={setSelectedDate} />
      <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
    </>
  );
}
```

For lightweight usage, omit `value` and optionally provide `defaultValue` to let the component manage its own selected value.

```tsx
<DatePicker defaultValue={new Date()} />
<DateRangePicker defaultValue={{ startDate: new Date(), endDate: null }} />
```

## Date constraints

Use `minDate` and `maxDate` on either picker to limit selectable dates and calendar navigation. Dates outside the range are rendered as disabled, cannot be selected, and navigation arrows stop at the first/last month that can contain valid dates.

```tsx
const minDate = new Date(2026, 6, 10);
const maxDate = new Date(2026, 8, 20);

<DatePicker minDate={minDate} maxDate={maxDate} />
<DateRangePicker minDate={minDate} maxDate={maxDate} />
```

The constraint logic is adapter-driven, so custom calendar adapters decide whether a date is disabled and whether a month transition is allowed. If `minDate` or `maxDate` falls inside the visible month, only the out-of-range days in that month are disabled.

## DateRangePicker view modes

`DateRangePicker` supports two mobile presentation strategies through `viewMode`:

- `"infinite"` (default) keeps the existing mobile behavior by rendering a continuous multi-month stack.
- `"single"` renders one mobile month at a time with previous/next arrow navigation.

Desktop keeps the two-calendar range layout in both modes.

```tsx
<DateRangePicker viewMode="infinite" />
<DateRangePicker viewMode="single" minDate={minDate} maxDate={maxDate} />
```

Both modes reuse the same adapter-based month generation and range selection logic, so `renderDay`, disabled days, and boundary-aware navigation behave consistently.

## Custom day rendering

Use `renderDay` on either `DatePicker` or `DateRangePicker` to customize the visual contents of each calendar day. The picker still owns selection, range calculation, disabled state, focus behavior, and accessibility attributes; your renderer receives the already-computed state and returns only the content to display inside the safe day-cell container.

```tsx
import { DatePicker, type CalendarRenderDayProps } from 'aryan-date-picker';

const prices: Record<string, number> = {
  '2026-07-14': 129,
};

function BookingDay(day: CalendarRenderDayProps) {
  const price = prices[day.date.toISOString().slice(0, 10)];

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

The same prop is available on `DateRangePicker`, including both desktop calendars and the mobile multi-month layout.

## Why the localization layer exists

Date pickers need more than translated labels. Different calendars can have different years, month boundaries, month lengths, leap-year rules, weekday ordering, formatting, navigation behavior, and layout direction. Aryan Date Picker keeps those responsibilities behind a `CalendarAdapter` so `DatePicker`, `DateRangePicker`, and `Calendar` can stay calendar-agnostic.

The public value model remains standard JavaScript `Date`. Adapters interpret and render those `Date` instances in a calendar system, but consumers continue passing and receiving `Date` objects without a breaking API change.

## LocalizationProvider

`LocalizationProvider` places a calendar adapter in React context. Components below the provider use that adapter for formatting, month grids, navigation, comparisons, and direction.

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

## Switching calendars

Switch calendars by swapping the adapter; the picker values remain JavaScript `Date` instances.

```tsx
import {
  DatePicker,
  DateRangePicker,
  LocalizationProvider,
  createGregorianCalendarAdapter,
  jalaliCalendarAdapter,
} from 'aryan-date-picker';

const gregorianAdapter = createGregorianCalendarAdapter({ locale: 'en-US' });

export function CalendarSwitchingExample() {
  return (
    <>
      <LocalizationProvider adapter={gregorianAdapter}>
        <DatePicker />
        <DateRangePicker />
      </LocalizationProvider>

      <LocalizationProvider adapter={jalaliCalendarAdapter}>
        <DatePicker />
        <DateRangePicker />
      </LocalizationProvider>
    </>
  );
}
```

## Jalali calendar

The Jalali adapter renders actual Jalali calendar structure: Persian month names, weekday labels, Jalali month grids, Jalali month arithmetic, start/end of month, formatting, and leap-year-aware Esfand length. It exposes `direction: 'rtl'`, so existing direction support is applied automatically.

```tsx
import { DatePicker, LocalizationProvider, createJalaliCalendarAdapter } from 'aryan-date-picker';

const jalaliAdapter = createJalaliCalendarAdapter();

export function JalaliExample() {
  return (
    <LocalizationProvider adapter={jalaliAdapter}>
      <DatePicker />
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

Implement the `CalendarAdapter` interface and pass it to `LocalizationProvider`.

A custom adapter owns:

- calendar interpretation of JavaScript `Date` values
- month names and weekday labels
- month grid generation
- `startOfMonth`, `endOfMonth`, and `addMonths`
- day/month comparisons
- date formatting and parsing
- min/max constraint helpers for disabled days and allowed month navigation
- layout direction (`'ltr'` or `'rtl'`)

```tsx
import type { CalendarAdapter } from 'aryan-date-picker';
import { LocalizationProvider, DatePicker } from 'aryan-date-picker';

const customAdapter: CalendarAdapter = {
  // Implement the full adapter contract for your calendar system.
};

export function CustomCalendarExample() {
  return (
    <LocalizationProvider adapter={customAdapter}>
      <DatePicker />
    </LocalizationProvider>
  );
}
```
