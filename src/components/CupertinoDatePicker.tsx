import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface CupertinoDatePickerProps {
  id?: string;
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  error?: string;
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

export const CupertinoDatePicker: React.FC<CupertinoDatePickerProps> = ({
  id,
  label,
  value,
  onChange,
  error
}) => {
  // Parse initial YYYY-MM-DD value
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { day: '', month: '', year: '' };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { day: '', month: '', year: '' };
    return {
      year: parts[0],
      month: parts[1],
      day: parts[2]
    };
  };

  const initialParsed = parseDate(value);
  const [day, setDay] = useState<string>(initialParsed.day);
  const [month, setMonth] = useState<string>(initialParsed.month);
  const [year, setYear] = useState<string>(initialParsed.year);

  // Years options: from current year minus 10 (minimum age is 10) down to 1940
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 10; // 2016 for year 2026
  const minYear = 1945;
  const yearsList = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (maxYear - i).toString());

  // Generate days based on month and year (handling leap years)
  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31;
    const monthNum = parseInt(m, 10);
    const yearNum = y ? parseInt(y, 10) : new Date().getFullYear();
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const daysCount = getDaysInMonth(month, year);
  const daysList = Array.from({ length: daysCount }, (_, i) => {
    const d = i + 1;
    return d < 10 ? `0${d}` : d.toString();
  });

  // Keep day state within valid range when month/year changes
  useEffect(() => {
    if (day && parseInt(day, 10) > daysCount) {
      setDay(daysCount.toString());
    }
  }, [month, year, daysCount]);

  // Update parent state when any segment changes
  useEffect(() => {
    if (day && month && year) {
      const formattedDate = `${year}-${month}-${day}`;
      if (formattedDate !== value) {
        onChange(formattedDate);
      }
    } else {
      onChange('');
    }
  }, [day, month, year]);

  // If initial value changes externally, sync internal state
  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed.day !== day) setDay(parsed.day);
    if (parsed.month !== month) setMonth(parsed.month);
    if (parsed.year !== year) setYear(parsed.year);
  }, [value]);

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label htmlFor={id} className="text-[13px] font-bold text-[#3A3A3C] tracking-wide ml-1 flex items-center space-x-1">
        <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
        <span>{label}</span>
      </label>

      {/* iOS Cupertino Style Select Wheel/Columns */}
      <div className={`grid grid-cols-3 gap-2 p-1.5 bg-[#F2F2F7] border ${error ? 'border-red-400' : 'border-[#E5E5EA]'} rounded-2xl`}>
        {/* DAY SELECT */}
        <div className="relative">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full h-12 bg-white rounded-xl px-3 text-sm font-semibold text-black appearance-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] shadow-sm transition-all cursor-pointer text-center"
          >
            <option value="" disabled className="text-slate-400">Day</option>
            {daysList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-[8px]">
            ▼
          </div>
        </div>

        {/* MONTH SELECT */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full h-12 bg-white rounded-xl px-3 text-sm font-semibold text-black appearance-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] shadow-sm transition-all cursor-pointer text-center"
          >
            <option value="" disabled className="text-slate-400">Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-[8px]">
            ▼
          </div>
        </div>

        {/* YEAR SELECT */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full h-12 bg-white rounded-xl px-3 text-sm font-semibold text-black appearance-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] shadow-sm transition-all cursor-pointer text-center"
          >
            <option value="" disabled className="text-slate-400">Year</option>
            {yearsList.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-[8px]">
            ▼
          </div>
        </div>
      </div>

      {error && (
        <span className="text-xs font-medium text-red-500 px-1 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};
