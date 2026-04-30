import React from 'react';

const STEPS = [
  { id: 'dates', label: 'Dates' },
  { id: 'package', label: 'Package' },
  { id: 'room', label: 'Room' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'details', label: 'Details' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirm', label: 'Confirm' },
];

interface StepIndicatorProps {
  currentStepIndex: number;
}

export default function StepIndicator({ currentStepIndex }: StepIndicatorProps) {
  return (
    <div className="w-full bg-background border-b border-[#F2E8E0] px-margin-edge py-8">
      <div className="max-w-container-max mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 group flex-1">
                <div
                  className={`w-full h-1 transition-colors ${
                    index <= currentStepIndex ? 'bg-primary' : 'bg-outline-variant/30 group-hover:bg-outline-variant/60'
                  }`}
                ></div>
                <span
                  className={`font-label-caps text-[10px] uppercase tracking-[0.2em] ${
                    index <= currentStepIndex ? 'text-primary' : 'text-outline'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && <div className="w-4"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
