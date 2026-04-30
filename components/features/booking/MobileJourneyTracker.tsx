"use client";
import React, { useState } from 'react';
import JourneySidebar from './JourneySidebar';

interface MobileJourneyTrackerProps {
  currentStepIndex: number;
}

const STEP_LABELS = ['Dates', 'Package', 'Room', 'Add-ons', 'Details', 'Payment', 'Confirm'];

export default function MobileJourneyTracker({ currentStepIndex }: MobileJourneyTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden border-b border-[#F2E8E0] bg-[#FBF8F6]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center text-primary font-noto-serif italic text-sm"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">map</span>
          <span>Your Journey: <span className="font-bold underline">{STEP_LABELS[currentStepIndex]}</span></span>
        </div>
        <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          keyboard_arrow_down
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-background animate-in slide-in-from-bottom-full duration-500">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant">
              <h2 className="font-display text-xl text-primary">Your Journey</h2>
              <button onClick={() => setIsOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <JourneySidebar currentStepIndex={currentStepIndex} isMobile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
