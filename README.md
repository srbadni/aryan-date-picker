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

## Workspace

This repository is a minimal pnpm workspace:

- `packages/date-picker` contains the publishable library.
- `playground` contains a local Vite + React + TypeScript development app.

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```
