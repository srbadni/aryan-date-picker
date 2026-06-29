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

export function App() {
  const [gregorianDate, setGregorianDate] = useState<Date | null>(null);
  const [gregorianRange, setGregorianRange] = useState<DateRangeValue | null>(null);
  const [jalaliDate, setJalaliDate] = useState<Date | null>(null);
  const [jalaliRange, setJalaliRange] = useState<DateRangeValue | null>(null);

  return (
    <main style={{ display: 'grid', gap: '2rem', padding: '2rem' }}>
      <section>
        <h1>Gregorian calendar</h1>
        <LocalizationProvider adapter={gregorianAdapter}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <DatePicker value={gregorianDate} onChange={setGregorianDate} />
            <DateRangePicker value={gregorianRange} onChange={setGregorianRange} />
          </div>
        </LocalizationProvider>
      </section>

      <section>
        <h1>Jalali calendar</h1>
        <LocalizationProvider adapter={jalaliCalendarAdapter}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <DatePicker value={jalaliDate} onChange={setJalaliDate} />
            <DateRangePicker value={jalaliRange} onChange={setJalaliRange} />
          </div>
        </LocalizationProvider>
      </section>
    </main>
  );
}
