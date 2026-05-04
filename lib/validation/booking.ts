import type { AvailabilityInput, BookingInput } from "@/lib/cloudbeds/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class InputValidationError extends Error {
  readonly status = 400;

  constructor(public readonly details: string[]) {
    super("Validation failed");
    this.name = "InputValidationError";
  }
}

function isValidIsoDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toInt(value: unknown): number {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : Number.NaN;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
  }
  return Number.NaN;
}

export function parseAvailabilityInput(raw: unknown): AvailabilityInput {
  const issues: string[] = [];
  const payload = (raw ?? {}) as Record<string, unknown>;

  const checkIn = String(payload.checkIn ?? "").trim();
  const checkOut = String(payload.checkOut ?? "").trim();
  const adults = toInt(payload.adults);
  const children = toInt(payload.children ?? 0);

  if (!isValidIsoDate(checkIn)) issues.push("checkIn must be in YYYY-MM-DD format");
  if (!isValidIsoDate(checkOut)) issues.push("checkOut must be in YYYY-MM-DD format");

  if (isValidIsoDate(checkIn) && isValidIsoDate(checkOut)) {
    const inDate = new Date(`${checkIn}T00:00:00Z`).getTime();
    const outDate = new Date(`${checkOut}T00:00:00Z`).getTime();
    if (outDate <= inDate) {
      issues.push("checkOut must be after checkIn");
    }
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 10) {
    issues.push("adults must be a number between 1 and 10");
  }

  if (!Number.isInteger(children) || children < 0 || children > 10) {
    issues.push("children must be a number between 0 and 10");
  }

  if (issues.length > 0) {
    throw new InputValidationError(issues);
  }

  return {
    checkIn,
    checkOut,
    adults,
    children,
  };
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseBookingInput(raw: unknown): BookingInput {
  const payload = (raw ?? {}) as Record<string, unknown>;
  const base = parseAvailabilityInput(payload);
  const issues: string[] = [];

  const roomTypeId = String(payload.roomTypeId ?? "").trim();
  const ratePlanId = String(payload.ratePlanId ?? "").trim();
  const firstName = String(payload.firstName ?? "").trim();
  const lastName = String(payload.lastName ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const phone = String(payload.phone ?? "").trim();
  const country = String(payload.country ?? "").trim();
  const notes = String(payload.notes ?? "").trim();
  const itemsRaw = payload.items;
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(i => String(i)) : [];

  if (roomTypeId.length === 0) issues.push("roomTypeId is required");
  if (firstName.length < 2) issues.push("firstName must be at least 2 characters");
  if (lastName.length < 2) issues.push("lastName must be at least 2 characters");
  if (!isEmail(email)) issues.push("email is invalid");
  if (phone.length < 6) issues.push("phone must be at least 6 characters");

  if (issues.length > 0) {
    throw new InputValidationError(issues);
  }

  return {
    ...base,
    roomTypeId,
    ratePlanId: ratePlanId || undefined,
    firstName,
    lastName,
    email,
    phone,
    country: country || undefined,
    notes: notes || undefined,
    items,
  };
}
