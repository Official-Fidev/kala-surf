import React, { useState } from 'react';

interface DatePickerStepProps {
  checkIn: string;
  checkOut: string;
  onDateChange: (checkIn: string, checkOut: string) => void;
}

export default function DatePickerStep({ checkIn, checkOut, onDateChange }: DatePickerStepProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const nowInMakassar = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Makassar",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const [year, month] = nowInMakassar.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Simplified calendar generation
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    return prevMonthLastDay - firstDayOfMonth + i + 1;
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isSelected = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return dateStr === checkIn || dateStr === checkOut;
  };

  const isInRange = (day: number) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return dayDate > start && dayDate < end;
  };

  return (
    <section className="flex-1">
      <div className="mb-8 md:mb-12">
        <h1 className="font-display text-3xl md:text-5xl text-primary mb-4">Select Your Dates</h1>
        <p className="font-body text-base md:text-lg text-secondary max-w-xl">
          Find the perfect window for your escape. Our boutique villas offer seasonal availability carefully curated for the most serene coastal weather.
        </p>
      </div>
      <div className="bg-surface-container-lowest p-6 md:p-12 border border-outline-variant/30">
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="material-symbols-outlined text-primary p-2 hover:bg-secondary-container/50 rounded-full transition-colors"
          >
            chevron_left
          </button>
          <h2 className="font-headline text-xl md:text-2xl text-primary">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="material-symbols-outlined text-primary p-2 hover:bg-secondary-container/50 rounded-full transition-colors"
          >
            chevron_right
          </button>
        </div>
        <div className="calendar-grid text-center mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="font-label-caps text-outline text-[10px] md:text-xs pb-4 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid gap-y-2 md:gap-y-4">
          {prevMonthDays.map((day) => (
            <div key={`prev-${day}`} className="h-10 md:h-16 flex items-center justify-center text-outline-variant/50 text-sm md:text-base">
              {day}
            </div>
          ))}
          {currentMonthDays.map((day) => {
            const selected = isSelected(day);
            const inRange = isInRange(day);
            const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            return (
              <div
                key={day}
                onClick={() => {
                   if (dateStr === checkIn) {
                     onDateChange("", checkOut);
                     return;
                   }
                   if (dateStr === checkOut) {
                     onDateChange(checkIn, "");
                     return;
                   }

                   if (!checkIn) {
                     onDateChange(dateStr, checkOut);
                   } else if (!checkOut) {
                     if (new Date(dateStr) < new Date(checkIn)) {
                       onDateChange(dateStr, checkIn);
                     } else {
                       onDateChange(checkIn, dateStr);
                     }
                   } else {
                     // Both filled, start over
                     onDateChange(dateStr, "");
                   }
                }}
                className={`h-10 md:h-16 flex items-center justify-center relative group cursor-pointer transition-colors text-sm md:text-base ${
                  selected ? 'bg-primary-container text-white' : inRange ? 'bg-secondary-container/30 text-primary' : 'text-secondary hover:bg-surface-container'
                }`}
              >
                <span className="z-10">{day}</span>
                {selected && <div className="absolute inset-0 border border-primary-container"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
