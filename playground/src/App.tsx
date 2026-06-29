import {
  DatePicker,
  DateRangePicker,
  LocalizationProvider,
  createGregorianCalendarAdapter,
  jalaliCalendarAdapter,
} from 'aryan-date-picker';
import 'aryan-date-picker/styles.css';

const gregorianAdapter = createGregorianCalendarAdapter({ locale: 'en-US' });

export function App() {
  return (
    <main style={{ display: 'grid', gap: '2rem', padding: '2rem' }}>
      <section>
        <h1>Gregorian calendar</h1>
        <LocalizationProvider adapter={gregorianAdapter}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <DatePicker />
            <DateRangePicker />
          </div>
        </LocalizationProvider>
      </section>

      <section>
        <h1>Jalali calendar</h1>
        <LocalizationProvider adapter={jalaliCalendarAdapter}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <DatePicker />
            <DateRangePicker />
          </div>
        </LocalizationProvider>
      </section>
    </main>
  );
}
