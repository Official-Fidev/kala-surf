import React from 'react';
import { formatNightPrice, cleanHtmlText } from '@/lib/cloudbeds/utils';
import { RoomOption } from '@/lib/cloudbeds/types';

interface RoomSelectionStepProps {
  rooms: RoomOption[];
  selectedRoomId?: string;
  onSelectRoom: (room: RoomOption) => void;
  onBack: () => void;
  categoryLabel: string;
}

export default function RoomSelectionStep({ 
  rooms, 
  selectedRoomId, 
  onSelectRoom,
  onBack,
  categoryLabel
}: RoomSelectionStepProps) {
  return (
    <section className="flex-1">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="material-symbols-outlined text-primary p-2 hover:bg-secondary-container/50 rounded-full transition-colors"
          >
            arrow_back
          </button>
          <p className="font-label-caps text-primary uppercase text-xs">STEP 03</p>
        </div>
        <h1 className="font-display text-3xl md:text-5xl text-primary">Sanctuaries in {categoryLabel}</h1>
        <p className="font-body text-base md:text-lg text-secondary max-w-2xl mt-4 md:mt-6">
          Explore the specific retreats within your chosen category. Each space is designed for ultimate serenity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-gutter">
        {rooms.map((room) => {
          const isSelected = selectedRoomId === room.roomTypeId;
          
          return (
            <div 
              key={`${room.roomTypeId}-${room.ratePlanId}`} 
              className="group cursor-pointer relative"
              onClick={() => onSelectRoom(room)}
            >
              <div className={`relative aspect-[4/3] overflow-hidden mb-6 bg-surface-container transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                {room.imageUrl ? (
                  <img
                    alt={room.roomTypeName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={room.imageUrl}
                  />
                ) : (
                  <div className="w-full h-full bg-[linear-gradient(135deg,#153951_0%,#2f5069_100%)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-6xl">bed</span>
                  </div>
                )}
                <div className={`absolute inset-0 transition-colors duration-500 ${isSelected ? 'bg-primary/10' : 'bg-primary/0 group-hover:bg-primary/5'}`}></div>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-xl text-primary">{room.roomTypeName}</h3>
                <div className="text-right">
                  <span className="font-label-caps text-primary font-bold">{formatNightPrice(room.price)}</span>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1 text-xs text-secondary font-label-caps">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span>{room.maxGuests} Guests</span>
                </div>
                {room.isPrivate !== undefined && (
                   <div className="flex items-center gap-1 text-xs text-secondary font-label-caps">
                    <span className="material-symbols-outlined text-sm">
                      {room.isPrivate ? 'lock' : 'group'}
                    </span>
                    <span>{room.isPrivate ? 'Private' : 'Shared'}</span>
                  </div>
                )}
              </div>

              <p className="font-body text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
                {cleanHtmlText(room.description)}
              </p>

              <button
                className={`w-full py-4 border font-label-caps text-[10px] tracking-widest transition-all duration-300 uppercase ${
                  isSelected 
                    ? 'bg-primary text-white border-primary' 
                    : 'border-outline text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isSelected ? 'SELECTED' : 'CHOOSE THIS ROOM'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
