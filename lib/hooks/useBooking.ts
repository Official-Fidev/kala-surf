import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
  AddOn,
  AvailabilityInput,
  AvailabilityResponse,
  BookingResponse,
  CategoryGroup,
  GuestForm,
  GuestFormErrors,
  RoomOption,
} from "@/lib/cloudbeds/types";
import {
  addDays,
  categoryMeta,
  deriveCategory,
  validateGuestForm,
} from "@/lib/cloudbeds/utils";

export function useBooking() {
  const initialDates = useMemo(() => {
    return {
      checkIn: "",
      checkOut: "",
    };
  }, []);

  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityInput>({
    ...initialDates,
    adults: 2,
    children: 0,
  });
  
  const [guestForm, setGuestForm] = useState<GuestForm>({
    firstName: "",
    lastName: "",
    gender: "Female",
    arrivalTime: "02:00",
    country: "United States",
    email: "",
    phoneCode: "+1",
    phone: "",
    etd: "",
    notes: "",
  });

  const [guestErrors, setGuestErrors] = useState<GuestFormErrors>({});
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addOnsLoading, setAddOnsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingResponse | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Step logic
  const [bookingStep, setBookingStep] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [detailRoom, setDetailRoom] = useState<RoomOption | null>(null);

  const categoryGroups = useMemo(() => {
    const grouped = new Map<string, RoomOption[]>();

    for (const room of rooms) {
      const key = deriveCategory(room);
      const arr = grouped.get(key) ?? [];
      arr.push(room);
      grouped.set(key, arr);
    }

    const result: CategoryGroup[] = Array.from(grouped.entries()).map(([key, groupedRooms]) => {
      const meta = categoryMeta(key);
      const withImage = groupedRooms.find((room) => room.imageUrl);
      return {
        key,
        label: meta.label,
        description: meta.description,
        rooms: groupedRooms,
        imageUrl: withImage?.imageUrl,
      };
    });

    result.sort((a, b) => b.rooms.length - a.rooms.length || a.label.localeCompare(b.label));
    return result;
  }, [rooms]);

  const activeGroup = useMemo(
    () => categoryGroups.find((group) => group.key === activeCategory) ?? null,
    [activeCategory, categoryGroups],
  );

  const filteredRooms = activeGroup?.rooms ?? [];

  const globalFallbackImage = useMemo(() => {
    const withImage = rooms.find((room) => room.imageUrl && room.imageUrl.length > 0);
    return withImage?.imageUrl;
  }, [rooms]);

  const stayNights = useMemo(() => {
    const checkIn = new Date(`${availabilityForm.checkIn}T00:00:00`);
    const checkOut = new Date(`${availabilityForm.checkOut}T00:00:00`);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return 1;
    }

    const diff = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    return diff > 0 ? diff : 1;
  }, [availabilityForm.checkIn, availabilityForm.checkOut]);

  const summary = useMemo(() => {
    if (!selectedRoom?.price || !Number.isFinite(selectedRoom.price)) {
      return null;
    }

    const subtotalRooms = selectedRoom.price * stayNights;
    const subtotalAddOns = selectedAddOns.reduce((total, id) => {
      const addon = addOns.find((a) => a.itemId === id);
      return total + (addon?.price ?? 0);
    }, 0);

    const subtotal = subtotalRooms + subtotalAddOns;
    const taxesAndFees = subtotal * 0.16;
    const total = subtotal + taxesAndFees;
    const deposit = total * 0.5;

    return { subtotal, subtotalRooms, subtotalAddOns, taxesAndFees, total, deposit };
  }, [selectedRoom, stayNights, selectedAddOns, addOns]);

  const currentStep = useMemo(() => {
    if (success && bookingStep === 5) return 6;
    if (success) return 7; // Success/Confirm screen is now Step 7
    if (showBookingForm) return 5;
    if (bookingStep === 5) return 6;
    if (bookingStep === 4) return 5;
    if (bookingStep === 3) return 4;
    if (bookingStep === 2) return 3;
    if (bookingStep === 1) return 2;
    if (bookingStep === 0) return 1;
    return 1;
  }, [bookingStep, showBookingForm, success]);

  async function fetchAddOns() {
    setAddOnsLoading(true);
    try {
      const res = await fetch("/api/cloudbeds/addons");
      if (!res.ok) throw new Error("Failed to fetch add-ons");
      const data = await res.json();
      setAddOns(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load add-ons, please try again.");
    } finally {
      setAddOnsLoading(false);
    }
  }

  async function runAvailabilitySearch() {
    setError(null);
    setSuccess(null);
    setSearchLoading(true);

    try {
      const response = await fetch("/api/cloudbeds/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(availabilityForm),
      });

      const payload = (await response.json()) as AvailabilityResponse | { message?: string; errors?: string[] };

      if (!response.ok) {
        const message = "message" in payload ? payload.message : "";
        const details = "errors" in payload && Array.isArray(payload.errors) ? payload.errors.join("; ") : "";
        throw new Error([message, details].filter(Boolean).join(" - ") || "Gagal ambil availability");
      }

      const result = payload as AvailabilityResponse;
      setRooms(result.rooms || []);
      setSelectedRoom((result.rooms || [])[0] ?? null);
      setActiveCategory(null);
      setShowBookingForm(false);
      setGuestErrors({});
      setBookingStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi error saat ambil data kamar");
      setRooms([]);
      setSelectedRoom(null);
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await runAvailabilitySearch();
  }

  async function handlePayment() {
    if (!success || !summary) {
      console.error("[useBooking] Cannot initiate payment: missing success or summary", { success, summary });
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/xendit/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: success.reservationId,
          amount: Math.round(summary.total),
          customer: {
            firstName: guestForm.firstName,
            lastName: guestForm.lastName,
            email: guestForm.email,
            phone: `${guestForm.phoneCode}${guestForm.phone}`,
          },
          description: `Booking Sanctuary at Coastal Escape - Res #${success.reservationId}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment link");
      }

      console.log("[useBooking] Xendit Invoice created:", data.invoice_url);
      setPaymentUrl(data.invoice_url);
      window.location.href = data.invoice_url;
    } catch (err) {
      console.error("[useBooking] Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handleBooking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedRoom) {
      setError("Pilih kamar terlebih dahulu");
      return;
    }

    const formErrors = validateGuestForm(guestForm);
    if (Object.keys(formErrors).length > 0) {
      setGuestErrors(formErrors);
      return;
    }

    setError(null);
    setSuccess(null);
    setGuestErrors({});
    setBookingLoading(true);

    const countryMap: Record<string, string> = {
      "United States": "US",
      "Indonesia": "ID",
      "Australia": "AU",
      "Singapore": "SG",
      "United Kingdom": "GB",
    };

    const mappedCountry = countryMap[guestForm.country] || guestForm.country;
    const mappedGender = guestForm.gender === "Male" ? "M" : guestForm.gender === "Female" ? "F" : guestForm.gender;

    const noteParts = [
      guestForm.notes.trim() ? `Notes: ${guestForm.notes.trim()}` : null,
      guestForm.etd.trim() ? `ETD: ${guestForm.etd.trim()}` : null,
      `Country: ${mappedCountry}`,
      `Gender: ${mappedGender}`,
      `ETA: ${guestForm.arrivalTime}`,
    ].filter(Boolean);

    const mergedPhone = `${guestForm.phoneCode}${guestForm.phone}`.replace(/[^0-9+]/g, "");

    const bookingPayload = {
      ...availabilityForm,
      firstName: guestForm.firstName,
      lastName: guestForm.lastName,
      email: guestForm.email,
      phone: mergedPhone,
      country: mappedCountry,
      notes: noteParts.join(" | "),
      roomTypeId: selectedRoom.roomTypeId,
      ratePlanId: selectedRoom.ratePlanId,
    };

    console.log("[useBooking] Submitting booking with payload:", bookingPayload);

    try {
      const response = await fetch("/api/cloudbeds/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const payload = (await response.json()) as BookingResponse | { message?: string; errors?: string[]; details?: any };

      console.log("[useBooking] Received response:", {
        status: response.status,
        ok: response.ok,
        payload
      });

      if (!response.ok) {
        const message = "message" in payload ? payload.message : "";
        const details = "errors" in payload && Array.isArray(payload.errors) ? payload.errors.join("; ") : "";
        const rawDetails = "details" in payload ? JSON.stringify(payload.details) : "";
        
        const errorMessage = [message, details, rawDetails].filter(Boolean).join(" - ") || "Gagal membuat booking";
        console.error("[useBooking] Booking error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("[useBooking] Booking SUCCESS:", payload);
      setSuccess(payload as BookingResponse);
      setShowBookingForm(false);
      // Move to Step 6 (Payment)
      setBookingStep(5);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi error saat submit booking";
      console.error("[useBooking] Catch block error:", errorMessage);
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setBookingLoading(false);
    }
  }

  return {
    availabilityForm,
    setAvailabilityForm,
    guestForm,
    setGuestForm,
    guestErrors,
    setGuestErrors,
    rooms,
    selectedRoom,
    setSelectedRoom,
    searchLoading,
    bookingLoading,
    paymentLoading,
    error,
    setError,
    success,
    paymentUrl,
    bookingStep,
    setBookingStep,
    showBookingForm,
    setShowBookingForm,
    selectedAddOns,
    setSelectedAddOns,
    activeCategory,
    setActiveCategory,
    detailRoom,
    setDetailRoom,
    categoryGroups,
    activeGroup,
    filteredRooms,
    globalFallbackImage,
    stayNights,
    summary,
    currentStep,
    runAvailabilitySearch,
    fetchAddOns,
    addOns,
    addOnsLoading,
    handleSearch,
    handleBooking,
    handlePayment,
  };
}
