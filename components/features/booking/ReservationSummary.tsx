import React from 'react';
import { formatDateForSummary, formatCurrency } from '@/lib/cloudbeds/utils';

interface ReservationSummaryProps {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total?: number;
  onContinue: () => void;
  onEditDates?: () => void;
  continueLabel: string;
  isContinueDisabled?: boolean;
}

export default function ReservationSummary({
  checkIn,
  checkOut,
  nights,
  guests,
  total,
  onContinue,
  onEditDates,
  continueLabel,
  isContinueDisabled,
}: ReservationSummaryProps) {
  return (
    <aside className="w-full lg:w-96 flex flex-col gap-8">
      <div className="relative h-64 overflow-hidden shadow-2xl">
        <img
          alt="Resort overview"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEe4O5TOcVeSplrS_2zN3Wsezb75JMaRt-bJ9GmznhUefqXNgINEKzT-GYZvIh9OUZf51LlVrwTZ85pNFxUD-CjhxFssIJMT2RoZ2snH9wQtWtPheyHYjPMHMidIK5cI5jd5We3J0XrWlrnYZqOsNXRMTbbaAOjDWFGedk41ybAJRTxyfDHfAtW8IWGKPAIksHG3h-UDTAOnAzjPgQQ6XCmFzdjXFjhyAkwZSE3OrkdZdOT513aIoUI5yzBnQQJNDtVu8o4ZXh7TFG"
        />
      </div>
      <div className="bg-surface-container-low p-8 border border-outline-variant/20">
        <h3 className="font-headline-md text-primary mb-6">Reservation Details</h3>
        <div className="space-y-6 mb-8">
          <div 
            className={`flex justify-between items-end border-b border-outline-variant pb-4 ${onEditDates ? 'cursor-pointer hover:bg-surface-container transition-colors' : ''}`}
            onClick={onEditDates}
          >
            <div>
              <span className="font-label-caps text-xs text-outline block mb-1 uppercase">Check-in</span>
              <span className="font-noto-serif text-lg text-primary">{checkIn ? formatDateForSummary(checkIn) : 'Select Date'}</span>
            </div>
            <span className="material-symbols-outlined text-primary/40" data-icon="east">
              east
            </span>
          </div>
          <div 
            className={`flex justify-between items-end border-b border-outline-variant pb-4 ${onEditDates ? 'cursor-pointer hover:bg-surface-container transition-colors' : ''}`}
            onClick={onEditDates}
          >
            <div>
              <span className="font-label-caps text-xs text-outline block mb-1 uppercase">Check-out</span>
              <span className="font-noto-serif text-lg text-primary">{checkOut ? formatDateForSummary(checkOut) : 'Select Date'}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4 mb-10">
          <div className="flex justify-between text-body-md text-secondary">
            <span>Nights</span>
            <span>{nights} {nights > 1 ? 'Nights' : 'Night'}</span>
          </div>
          <div className="flex justify-between text-body-md text-secondary">
            <span>Guests</span>
            <span>{guests} {guests > 1 ? 'Adults' : 'Adult'}</span>
          </div>
          <div className="flex justify-between text-body-lg text-primary font-bold pt-4 border-t border-outline-variant/40">
            <span>Estimated Total</span>
            <span>{total ? formatCurrency(total) : '---'}</span>
          </div>
        </div>
        <button
          onClick={onContinue}
          disabled={isContinueDisabled}
          className="w-full bg-primary text-on-primary py-4 font-label-caps tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {continueLabel}
        </button>
        <p className="text-center text-[10px] text-outline mt-4 font-label-caps uppercase tracking-widest">
          Pricing includes local taxes and fees
        </p>
      </div>
      <div className="p-8 border border-[#F2E8E0] italic font-noto-serif text-secondary text-sm">
        "The rhythm of the tides determines the flow of your stay. We recommend early October for the clearest waters and gentle afternoon breezes."
      </div>
    </aside>
  );
}
