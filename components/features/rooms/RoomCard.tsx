"use client";

import type { RoomOption } from "@/lib/cloudbeds/types";
import {
  cleanHtmlText,
  formatRoomPrice,
  roomHighlights,
} from "@/lib/cloudbeds/utils";

interface RoomCardProps {
  room: RoomOption;
  active: boolean;
  onSelect: () => void;
  onShowDetail: () => void;
  onBook: () => void;
  fallbackImage?: string;
}

export default function RoomCard({
  room,
  active,
  onSelect,
  onShowDetail,
  onBook,
  fallbackImage,
}: RoomCardProps) {
  const highlights = roomHighlights(room);
  const cardImage = room.imageUrl || fallbackImage;

  return (
    <div
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      className={`appearance-none overflow-hidden rounded-2xl border bg-white p-0 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        active ? "border-[#1f5a83] ring-2 ring-[#1f5a83]/20" : "border-[#d7c6af]"
      }`}
    >
      <div className="relative h-44 w-full bg-[linear-gradient(135deg,#7a4b2f_0%,#bd8b5f_40%,#f1d6b5_100%)]">
        {cardImage ? (
          <img
            src={cardImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 block h-full w-full object-cover object-[50%_35%]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.3),rgba(0,0,0,0.02))]" />
      </div>

      <div className="space-y-3 p-4">
        <h3 className="font-cabinet line-clamp-2 text-[1.25rem] md:text-[1.5rem] font-[900] leading-[1.3] text-[#214764]">
          {room.roomTypeName}
        </h3>

        {room.description ? (
          <p className="font-helvetica line-clamp-2 text-xs text-slate-500">
            {cleanHtmlText(room.description)}
          </p>
        ) : null}

        <ul className="font-helvetica space-y-1 text-sm text-slate-600">
          {highlights.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1d4f74]">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-500">
          {room.roomTypeUnits ?? 0} units, {room.roomsAvailable ?? 0} available
        </p>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-right text-sm font-semibold text-[#1d4f74]">
            {formatRoomPrice(room.price)}
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShowDetail();
            }}
            className="font-cabinet w-full rounded-2xl border border-[#1f4665] bg-transparent px-4 py-2.5 text-xs font-[700] uppercase tracking-[0.16em] text-[#1f4665] transition hover:bg-[#1f4665]/5"
          >
            Show More Details
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBook();
            }}
            className="font-helvetica w-full rounded-2xl bg-[#2f5575] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#274863]"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
