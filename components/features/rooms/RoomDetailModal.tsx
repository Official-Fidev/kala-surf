import React from 'react';
import { RoomOption } from '@/lib/cloudbeds/types';
import { formatNightPrice, cleanHtmlText } from '@/lib/cloudbeds/utils';

interface RoomDetailModalProps {
  room: RoomOption;
  onClose: () => void;
  onSelect: (room: RoomOption) => void;
  isSelected: boolean;
}

export default function RoomDetailModal({ room, onClose, onSelect, isSelected }: RoomDetailModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);
  
  if (!room) return null;

  const photos = room.photos && room.photos.length > 0 ? room.photos : room.imageUrl ? [room.imageUrl] : [];

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photos Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-surface-container relative group/gallery">
          {photos.length > 0 ? (
            <div className="h-full w-full relative">
              <img 
                src={photos[activePhotoIndex]} 
                alt={room.roomTypeName}
                className="w-full h-full object-cover transition-opacity duration-500"
                key={activePhotoIndex}
              />
              
              {photos.length > 1 && (
                <>
                  <button 
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover/gallery:opacity-100"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button 
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover/gallery:opacity-100"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  
                  <div className="absolute bottom-4 left-4 bg-primary/80 text-white px-3 py-1 text-[10px] font-label-caps tracking-widest uppercase backdrop-blur-md">
                    {activePhotoIndex + 1} / {photos.length} Photos
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[linear-gradient(135deg,#153951_0%,#2f5069_100%)]">
              <span className="material-symbols-outlined text-white/20 text-8xl">bed</span>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors md:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto flex flex-col">
          <div className="hidden md:flex justify-end mb-6">
            <button 
              onClick={onClose}
              className="text-outline hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          <div className="mb-8">
            <p className="font-label-caps text-outline uppercase text-[10px] tracking-[0.2em] mb-2">Room Detail</p>
            <h2 className="font-display text-3xl text-primary mb-4">{room.roomTypeName}</h2>
            <div className="flex items-center gap-6">
              <span className="font-display text-xl text-primary font-bold">
                {formatNightPrice(room.price)}
              </span>
              <div className="flex items-center gap-1 text-secondary font-label-caps text-xs">
                <span className="material-symbols-outlined text-sm">person</span>
                <span>Up to {room.maxGuests} Guests</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div>
              <h4 className="font-label-caps text-primary text-xs font-bold uppercase tracking-widest mb-3">About this sanctuary</h4>
              <p className="font-body text-secondary text-sm leading-relaxed">
                {cleanHtmlText(room.description) || "A serene space designed for deep rest and reconnection with the coastal rhythms. Every detail has been curated to provide a peaceful retreat after a day of surf and sun."}
              </p>
            </div>

            {room.features && room.features.length > 0 && (
              <div>
                <h4 className="font-label-caps text-primary text-xs font-bold uppercase tracking-widest mb-3">Features & Amenities</h4>
                <ul className="grid grid-cols-2 gap-y-3">
                  {room.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-secondary text-xs font-body">
                      <span className="material-symbols-outlined text-sm text-primary/60">check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-outline-variant/30">
            <button
              onClick={() => {
                onSelect(room);
                onClose();
              }}
              className={`w-full py-4 font-label-caps text-xs tracking-[0.2em] transition-all duration-300 uppercase ${
                isSelected 
                  ? 'bg-primary/10 text-primary border border-primary' 
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isSelected ? 'ALREADY SELECTED' : 'CHOOSE THIS ROOM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
