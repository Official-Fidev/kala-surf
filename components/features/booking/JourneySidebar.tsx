import React from 'react';

const MENU_ITEMS = [
  { id: 'dates', label: 'Date', icon: 'calendar_today' },
  { id: 'package', label: 'Package', icon: 'surfing' },
  { id: 'room', label: 'Room', icon: 'bed' },
  { id: 'addons', label: 'Add-ons', icon: 'add_circle' },
  { id: 'details', label: 'Details', icon: 'person' },
  { id: 'payment', label: 'Payment', icon: 'payments' },
];

interface JourneySidebarProps {
  currentStepIndex: number;
  isMobile?: boolean;
}

export default function JourneySidebar({ currentStepIndex, isMobile }: JourneySidebarProps) {
  return (
    <aside className={`${isMobile ? 'flex w-full' : 'hidden lg:flex w-64 border-r border-[#F2E8E0] sticky top-24'} flex-col pt-12 pb-12 h-screen bg-[#FBF8F6]`}>
      {!isMobile && (
        <div className="px-8 mb-12">
          <div className="font-bold text-primary font-headline-md">Your Journey</div>
          <div className="font-noto-serif text-sm italic text-secondary">Coastal Escape</div>
        </div>
      )}
      <nav className="flex flex-col gap-1">
        {MENU_ITEMS.map((item, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 py-4 pl-4 transition-all duration-500 ease-in-out font-noto-serif text-sm italic ${
                isActive
                  ? 'text-primary font-bold border-l-2 border-primary bg-secondary-container/30'
                  : isCompleted
                  ? 'text-primary pl-4 hover:bg-secondary-container/50'
                  : 'text-slate-400 pl-4 hover:bg-secondary-container/50'
              }`}
            >
              <span className="material-symbols-outlined" data-icon={item.icon}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
