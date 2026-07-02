import { useState } from 'react';
import {
  DatePicker,
  DateRangePicker,
  LocalizationProvider,
  createGregorianCalendarAdapter,
  jalaliCalendarAdapter,
  type DateRangeValue,
} from 'aryan-date-picker';
import 'aryan-date-picker/styles.css';

const gregorianAdapter = createGregorianCalendarAdapter({ locale: 'en-US' });

const sectionStyle = {
  display: 'grid',
  gap: '1rem',
  padding: '1.25rem',
  border: '1px solid #e5e7eb',
  borderRadius: '1rem',
} as const;

const formGridStyle = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  alignItems: 'start',
} as const;

export function App() {
  const [gregorianDate, setGregorianDate] = useState<Date | null>(null);
  const [gregorianRange, setGregorianRange] = useState<DateRangeValue | null>(null);
  const [jalaliDate, setJalaliDate] = useState<Date | null>(null);
  const [jalaliRange, setJalaliRange] = useState<DateRangeValue | null>(null);

  return (
    <main style={{ display: 'grid', gap: '2rem', padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ maxWidth: '760px' }}>
        <h1>Aryan Date Picker</h1>
        <p>
          Business-ready field mode is now the default. Inline calendars are still available with
          <code> displayMode="inline"</code> for dashboards and always-visible booking flows.
        </p>
      </header>

      <section style={sectionStyle}>
        <h2>Gregorian booking form</h2>
        <LocalizationProvider adapter={gregorianAdapter}>
          <div style={formGridStyle}>
            <DatePicker
              label="Check-in"
              name="checkIn"
              value={gregorianDate}
              onChange={setGregorianDate}
              minDate={new Date()}
              helperText="Keyboard: arrows move by day/week; Page Up/Down changes month."
            />
            <DateRangePicker
              label="Stay dates"
              name="stayDates"
              startName="stayStart"
              endName="stayEnd"
              value={gregorianRange}
              onChange={setGregorianRange}
              minDate={new Date()}
            />
          </div>
        </LocalizationProvider>
      </section>

      <section style={sectionStyle}>
        <h2>Jalali reservation form</h2>
        <LocalizationProvider adapter={jalaliCalendarAdapter}>
          <div style={formGridStyle}>
            <DatePicker
              label="تاریخ ورود"
              value={jalaliDate}
              onChange={setJalaliDate}
              minDate={new Date()}
              placeholder="انتخاب تاریخ"
            />
            <DateRangePicker
              label="بازه اقامت"
              value={jalaliRange}
              onChange={setJalaliRange}
              minDate={new Date()}
              placeholder="انتخاب بازه"
            />
          </div>
        </LocalizationProvider>
      </section>

      <section style={sectionStyle}>
        <h2>Inline calendar mode</h2>
        <LocalizationProvider adapter={gregorianAdapter}>
          <DateRangePicker displayMode="inline" value={gregorianRange} onChange={setGregorianRange} />
        </LocalizationProvider>
      </section>
    </main>
  );
}
