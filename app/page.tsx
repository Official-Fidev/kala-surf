"use client";

import { useBooking } from "@/lib/hooks/useBooking";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StepIndicator from "@/components/features/booking/StepIndicator";
import JourneySidebar from "@/components/features/booking/JourneySidebar";
import ReservationSummary from "@/components/features/booking/ReservationSummary";
import DatePickerStep from "@/components/features/booking/DatePickerStep";
import CategorySelectionStep from "@/components/features/booking/CategorySelectionStep";
import RoomSelectionStep from "@/components/features/booking/RoomSelectionStep";
import AddOnsSelectionStep from "@/components/features/booking/AddOnsSelectionStep";
import GuestDetailsStep from "@/components/features/booking/GuestDetailsStep";
import PaymentStep from "@/components/features/booking/PaymentStep";

export default function Home() {
  const {
    availabilityForm,
    setAvailabilityForm,
    guestForm,
    setGuestForm,
    guestErrors,
    stayNights,
    summary,
    setBookingStep,
    bookingStep,
    activeCategory,
    setActiveCategory,
    categoryGroups,
    searchLoading,
    runAvailabilitySearch,
    filteredRooms,
    selectedRoom,
    setSelectedRoom,
    activeGroup,
    fetchAddOns,
    addOns,
    addOnsLoading,
    selectedAddOns,
    setSelectedAddOns,
    handleBooking,
    handlePayment,
    bookingLoading,
    paymentLoading,
    success,
    error,
  } = useBooking();

  // Map our bookingStep to the steps in UI
  const currentStepIndex = bookingStep; 

  const handleDateChange = (checkIn: string, checkOut: string) => {
    setAvailabilityForm((prev) => ({ ...prev, checkIn, checkOut }));
  };

  const handleContinue = async () => {
    if (bookingStep === 0) {
      if (!availabilityForm.checkIn || !availabilityForm.checkOut) return;
      await runAvailabilitySearch();
      setBookingStep(1);
    } else if (bookingStep === 1) {
      if (!activeCategory) return;
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!selectedRoom) return;
      // Fetch dynamic add-ons from Cloudbeds when moving to Step 4
      await fetchAddOns();
      setBookingStep(3);
    } else if (bookingStep === 3) {
      setBookingStep(4);
    } else if (bookingStep === 4) {
      // Final booking submission
      const dummyEvent = { preventDefault: () => {} } as any;
      await handleBooking(dummyEvent);
    } else if (bookingStep === 5) {
      // Initiate Xendit Payment
      await handlePayment();
    } else {
      setBookingStep((prev) => prev + 1);
    }
  };

  if (bookingStep > 5 && success) {
    return (
      <div className="flex min-h-screen pt-24 flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-margin-edge py-12">
          <div className="max-w-2xl w-full bg-surface-container p-12 text-center border border-outline-variant shadow-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="font-display text-4xl text-primary mb-4">Booking Confirmed!</h1>
            <p className="font-noto-serif italic text-secondary mb-8">
              "The tides are waiting for you."
            </p>
            <div className="text-left bg-background p-6 border border-outline-variant/30 mb-8">
              <div className="flex justify-between mb-4">
                <span className="font-label-caps text-[10px] uppercase text-outline">Reservation ID</span>
                <span className="font-bold text-primary">{success.reservationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-caps text-[10px] uppercase text-outline">Status</span>
                <span className="font-bold text-primary uppercase">{success.status}</span>
              </div>
            </div>
            <p className="text-secondary text-sm mb-12">
              A confirmation email has been sent to {guestForm.email}. Please check your inbox for arrival instructions and deposit details.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-on-primary py-4 font-label-caps tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors"
            >
              Start New Journey
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-24 flex-col bg-background">
      <Header />
      
      {/* Step Indicator */}
      <StepIndicator currentStepIndex={currentStepIndex} />

      <div className="flex flex-1">
        {/* SideNavBar */}
        <JourneySidebar currentStepIndex={currentStepIndex} />

        {/* Main Content */}
        <main className="flex-1 px-margin-edge py-12 flex flex-col lg:flex-row gap-16">
          {bookingStep === 0 && (
            <DatePickerStep
              checkIn={availabilityForm.checkIn}
              checkOut={availabilityForm.checkOut}
              onDateChange={handleDateChange}
            />
          )}

          {bookingStep === 1 && (
            <CategorySelectionStep
              categories={categoryGroups}
              loading={searchLoading}
              selectedCategoryId={activeCategory || undefined}
              onSelectCategory={(id) => {
                setActiveCategory(id);
                setSelectedRoom(null);
              }}
              onBack={() => setBookingStep(0)}
            />
          )}

          {bookingStep === 2 && (
            <RoomSelectionStep
              rooms={filteredRooms}
              categoryLabel={activeGroup?.label || "Sanctuary"}
              selectedRoomId={selectedRoom?.roomTypeId}
              onSelectRoom={(room) => setSelectedRoom(room)}
              onBack={() => setBookingStep(1)}
            />
          )}

          {bookingStep === 3 && (
            <AddOnsSelectionStep
              addOns={addOns}
              loading={addOnsLoading}
              selectedAddOnIds={selectedAddOns}
              onToggleAddOn={(id) => {
                setSelectedAddOns(prev => 
                  prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
                );
              }}
              onBack={() => setBookingStep(2)}
            />
          )}

          {bookingStep === 4 && (
            <GuestDetailsStep
              form={guestForm}
              errors={guestErrors}
              onChange={(field, value) => setGuestForm(prev => ({ ...prev, [field]: value }))}
              onBack={() => setBookingStep(3)}
            />
          )}

          {bookingStep === 5 && success && (
            <PaymentStep
              reservationId={success.reservationId}
              total={summary?.total || 0}
              onPay={handlePayment}
              loading={paymentLoading}
              onBack={() => setBookingStep(4)}
            />
          )}
          
          {bookingStep > 5 && (
            <section className="flex-1 flex items-center justify-center border-2 border-dashed border-outline-variant p-20">
               <div className="text-center">
                 <h2 className="text-3xl font-headline text-primary mb-4">Step {bookingStep + 1}</h2>
                 <p className="text-secondary">This step is being implemented.</p>
                 <button 
                  onClick={() => setBookingStep(0)}
                  className="mt-8 text-primary font-bold underline"
                 >
                   Back to Date Selection
                 </button>
               </div>
            </section>
          )}

          {/* Sidebar Summary */}
          <ReservationSummary
            checkIn={availabilityForm.checkIn}
            checkOut={availabilityForm.checkOut}
            nights={stayNights}
            guests={availabilityForm.adults}
            total={summary?.total}
            onContinue={handleContinue}
            onEditDates={() => setBookingStep(0)}
            continueLabel={
              bookingStep === 0 ? "Continue to Packages" : 
              bookingStep === 1 ? "Continue to Rooms" : 
              bookingStep === 2 ? "Continue to Add-ons" :
              bookingStep === 3 ? "Continue to Details" :
              bookingStep === 4 ? (bookingLoading ? "Processing..." : "Confirm Booking") :
              bookingStep === 5 ? (paymentLoading ? "Redirecting..." : "Pay Now") :
              "Continue"
            }
            isContinueDisabled={
              (bookingStep === 0 && (!availabilityForm.checkIn || !availabilityForm.checkOut)) || 
              (bookingStep === 1 && !activeCategory) ||
              (bookingStep === 2 && !selectedRoom) ||
              bookingLoading ||
              paymentLoading
            }
          />
        </main>
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 bg-error text-on-error px-6 py-4 shadow-lg z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="underline font-bold ml-4">Retry</button>
        </div>
      )}

      <Footer />
    </div>
  );
}
