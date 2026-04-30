import { GuestForm, GuestFormErrors, RoomOption } from "@/lib/cloudbeds/types";

export function addDays(base: Date, days: number): string {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy.toISOString().slice(0, 10);
}

export function cleanHtmlText(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getRoomPhotos(room: RoomOption): string[] {
  const photos = (room.photos ?? []).filter((photo) => typeof photo === "string" && photo.length > 0);
  if (photos.length > 0) return photos;
  if (room.imageUrl) return [room.imageUrl];
  return [];
}

export function roomHighlights(room: RoomOption): string[] {
  const fromFeatures = (room.features ?? []).filter(Boolean).slice(0, 3);
  if (fromFeatures.length > 0) return fromFeatures;

  const fallback: string[] = [];
  if (room.maxGuests !== undefined) fallback.push(`Up to ${room.maxGuests} guests`);
  if (room.isPrivate !== undefined) fallback.push(room.isPrivate ? "Private room" : "Shared room");
  if (room.roomTypeUnits !== undefined) fallback.push(`${room.roomTypeUnits} room units`);
  return fallback.slice(0, 3);
}

export function formatRoomPrice(price?: number): string {
  if (price === undefined || !Number.isFinite(price)) {
    return "Price on request";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(price);

  return `Rp ${formatted} p.p`;
}

export function formatNightPrice(price?: number): string {
  if (price === undefined || !Number.isFinite(price)) {
    return "Price on request";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(price);

  return `IDR ${formatted}/night`;
}

export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `IDR ${formatted}`;
}

export function formatDateForSummary(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function validateGuestForm(input: GuestForm): GuestFormErrors {
  const errors: GuestFormErrors = {};
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();

  if (firstName.length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (lastName.length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email";
  }

  if (phone.length === 0) {
    errors.phone = "Phone is required";
  } else if (!/^\+?[0-9]{6,}$/.test(phone.replace(/\s/g, ""))) {
    errors.phone = "Phone must only contain digits and country code";
  }

  return errors;
}

export function deriveCategory(room: RoomOption): string {
  const source = `${room.roomTypeName} ${room.description ?? ""}`.toLowerCase();

  if (source.includes("female")) return "female-only";
  if (source.includes("mixed")) return "mixed";
  if (source.includes("family")) return "family";
  if (source.includes("surf") || source.includes("bc")) return "surfing";
  if (source.includes("dorm")) return "dorm";
  return "private";
}

export function categoryMeta(key: string): { label: string; description: string } {
  const map: Record<string, { label: string; description: string }> = {
    "female-only": {
      label: "Female Only",
      description: "Exclusive rooms for female travelers with a more private vibe.",
    },
    mixed: {
      label: "Mixed",
      description: "Mixed rooms for flexible solo travelers and groups.",
    },
    family: {
      label: "Family",
      description: "Spacious room options for families or small groups.",
    },
    surfing: {
      label: "Surfing",
      description: "Package and room categories related to the surf camp.",
    },
    dorm: {
      label: "Dorm",
      description: "Dormitory beds with the most efficient pricing.",
    },
    private: {
      label: "Private Room",
      description: "Private rooms for maximum comfort while resting.",
    },
  };

  return map[key] ?? { label: "Other", description: "Other categories based on Cloudbeds data." };
}
