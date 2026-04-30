import React from 'react';
import { formatRoomPrice, cleanHtmlText } from '@/lib/cloudbeds/utils';
import { CategoryGroup } from '@/lib/cloudbeds/types';

interface CategorySelectionStepProps {
  categories: CategoryGroup[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function CategorySelectionStep({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory,
  onBack,
  loading 
}: CategorySelectionStepProps) {
  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary font-noto-serif italic">Searching for available sanctuaries...</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="flex-1 py-20">
        <div className="text-center bg-surface-container p-12 border border-dashed border-outline-variant">
          <h2 className="font-display text-2xl text-primary mb-4">No Sanctuaries Available</h2>
          <p className="text-secondary mb-8">We couldn't find any available rooms for your selected dates. Please try different dates.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1">
      <header className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="material-symbols-outlined text-primary p-2 hover:bg-secondary-container/50 rounded-full transition-colors"
          >
            arrow_back
          </button>
          <p className="font-label-caps text-primary uppercase">STEP 02</p>
        </div>
        <h1 className="font-display text-5xl text-primary">Select Your Sanctuary</h1>
        <p className="font-body text-lg text-secondary max-w-2xl mt-6">
          From communal energy to private coastal retreats, choose the space that resonates with your journey.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {categories.map((group) => {
          const isSelected = selectedCategoryId === group.key;
          const validPrices = group.rooms
            .map((r) => r.price)
            .filter((p): p is number => p !== undefined && Number.isFinite(p));
          const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

          return (
            <div 
              key={group.key} 
              className="group cursor-pointer relative"
              onClick={() => onSelectCategory(group.key)}
            >
              <div className={`relative aspect-[4/3] overflow-hidden mb-6 bg-surface-container transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                {group.imageUrl ? (
                  <img
                    alt={group.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={group.imageUrl}
                  />
                ) : (
                   <div className="w-full h-full bg-[linear-gradient(135deg,#153951_0%,#2f5069_100%)] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/20 text-6xl">bed</span>
                   </div>
                )}
                <div className={`absolute inset-0 transition-colors duration-500 ${isSelected ? 'bg-primary/10' : 'bg-primary/0 group-hover:bg-primary/5'}`}></div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-xl text-primary">{group.label}</h3>
                <div className="text-right">
                  <span className="font-label-caps text-secondary uppercase block text-[10px]">Starting from</span>
                  <span className="font-label-caps text-primary font-bold">{formatRoomPrice(minPrice)}</span>
                </div>
              </div>
              <p className="font-body text-secondary text-sm leading-relaxed mb-6 line-clamp-2">
                {cleanHtmlText(group.description)}
              </p>
              <button
                className={`w-full py-4 border font-label-caps text-[10px] tracking-widest transition-all duration-300 uppercase ${
                  isSelected 
                    ? 'bg-primary text-white border-primary' 
                    : 'border-outline text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isSelected ? 'SELECTED' : 'VIEW OPTIONS'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
