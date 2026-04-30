import React from 'react';
import { formatCurrency, cleanHtmlText } from '@/lib/cloudbeds/utils';
import { AddOn } from '@/lib/cloudbeds/types';

interface AddOnsSelectionStepProps {
  addOns: AddOn[];
  selectedAddOnIds: string[];
  onToggleAddOn: (addOnId: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function AddOnsSelectionStep({ 
  addOns, 
  selectedAddOnIds, 
  onToggleAddOn,
  onBack,
  loading 
}: AddOnsSelectionStepProps) {
  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary font-noto-serif italic">Loading available add-ons...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="material-symbols-outlined text-primary p-2 hover:bg-secondary-container/50 rounded-full transition-colors"
          >
            arrow_back
          </button>
          <p className="font-label-caps text-primary uppercase">STEP 04</p>
        </div>
        <h1 className="font-display text-5xl text-primary">Enhance Your Stay</h1>
        <p className="font-body text-lg text-secondary max-w-2xl mt-6">
          Tailor your experience with our curated selection of coastal experiences and services.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {addOns.map((addon) => {
          const isSelected = selectedAddOnIds.includes(addon.itemId);
          
          // Fallback image dictionary for items without Cloudbeds images
          const addonMapping: Record<string, string> = {
            "Airport Pick Up": "/images/addons/airport.jpeg",
            "Laundry Service": "/images/addons/laundry.jpeg",
            "Extra Breakfast": "/images/addons/breakfast.jpeg",
            "Scooter Rental": "/images/addons/scooter.jpeg",
          };

          const imageUrl = addon.imageUrl || addonMapping[addon.name] || "/images/addons/default.jpeg";

          return (
            <div 
              key={addon.itemId} 
              className={`group cursor-pointer relative flex flex-col border transition-all duration-300 ${
                isSelected ? 'ring-2 ring-primary border-primary shadow-lg bg-secondary-container/10' : 'border-outline-variant hover:border-primary/50'
              }`}
              onClick={() => onToggleAddOn(addon.itemId)}
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
                <img
                  src={imageUrl}
                  alt={addon.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors"></div>
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-xl text-primary">{addon.name}</h3>
                  <span className="font-label-caps text-primary font-bold">{formatCurrency(addon.price)}</span>
                </div>
                
                <p className="font-body text-secondary text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                  {cleanHtmlText(addon.description)}
                </p>

                <div className="mt-auto">
                   <button
                    className={`w-full py-3 border font-label-caps text-[10px] tracking-widest transition-all duration-300 uppercase ${
                      isSelected 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-outline text-primary group-hover:bg-primary group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'ADDED TO JOURNEY' : 'ADD TO JOURNEY'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {addOns.length === 0 && (
        <div className="text-center py-12 bg-surface-container border border-dashed border-outline-variant">
          <p className="text-secondary italic">No additional services available at this time.</p>
        </div>
      )}
    </section>
  );
}
