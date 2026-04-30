import React from 'react';
import { GuestForm, GuestFormErrors } from '@/lib/cloudbeds/types';

interface GuestDetailsStepProps {
  form: GuestForm;
  errors: GuestFormErrors;
  onChange: (field: keyof GuestForm, value: string) => void;
  onBack: () => void;
}

const COUNTRIES = [
  "United States",
  "Indonesia",
  "Australia",
  "Singapore",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Canada",
];

const GENDERS = ["Female", "Male", "Other"];

const ARRIVAL_TIMES = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

const PHONE_CODES = [
  { code: "+1", label: "US (+1)" },
  { code: "+62", label: "ID (+62)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+65", label: "SG (+65)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+82", label: "KR (+82)" },
];

export default function GuestDetailsStep({
  form,
  errors,
  onChange,
  onBack,
}: GuestDetailsStepProps) {
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
          <p className="font-label-caps text-primary uppercase text-xs">STEP 05</p>
        </div>
        <h1 className="font-display text-3xl md:text-5xl text-primary">Guest Details</h1>
        <p className="font-body text-base md:text-lg text-secondary max-w-2xl mt-4 md:mt-6">
          Please provide your information to complete the booking.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* First Name */}
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`bg-surface-container border p-4 outline-none focus:border-primary transition-colors text-sm md:text-base ${errors.firstName ? 'border-error' : 'border-outline-variant'}`}
            placeholder="e.g. John"
          />
          {errors.firstName && <span className="text-error text-xs">{errors.firstName}</span>}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={`bg-surface-container border p-4 outline-none focus:border-primary transition-colors text-sm md:text-base ${errors.lastName ? 'border-error' : 'border-outline-variant'}`}
            placeholder="e.g. Doe"
          />
          {errors.lastName && <span className="text-error text-xs">{errors.lastName}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`bg-surface-container border p-4 outline-none focus:border-primary transition-colors text-sm md:text-base ${errors.email ? 'border-error' : 'border-outline-variant'}`}
            placeholder="e.g. john.doe@example.com"
          />
          {errors.email && <span className="text-error text-xs">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Phone Number</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={form.phoneCode}
              onChange={(e) => onChange('phoneCode', e.target.value)}
              className="bg-surface-container border border-outline-variant p-4 outline-none focus:border-primary transition-colors w-full sm:w-32 text-sm md:text-base"
            >
              {PHONE_CODES.map((pc) => (
                <option key={pc.code} value={pc.code}>{pc.label}</option>
              ))}
            </select>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={`flex-1 bg-surface-container border p-4 outline-none focus:border-primary transition-colors text-sm md:text-base ${errors.phone ? 'border-error' : 'border-outline-variant'}`}
              placeholder="e.g. 812345678"
            />
          </div>
          {errors.phone && <span className="text-error text-xs">{errors.phone}</span>}
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="bg-surface-container border border-outline-variant p-4 outline-none focus:border-primary transition-colors text-sm md:text-base"
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Country</label>
          <select
            value={form.country}
            onChange={(e) => onChange('country', e.target.value)}
            className="bg-surface-container border border-outline-variant p-4 outline-none focus:border-primary transition-colors text-sm md:text-base"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Arrival Time */}
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Estimated Arrival</label>
          <select
            value={form.arrivalTime}
            onChange={(e) => onChange('arrivalTime', e.target.value)}
            className="bg-surface-container border border-outline-variant p-4 outline-none focus:border-primary transition-colors text-sm md:text-base"
          >
            {ARRIVAL_TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ETD (Estimated Departure) - Optional */}
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Estimated Departure (Optional)</label>
          <select
            value={form.etd}
            onChange={(e) => onChange('etd', e.target.value)}
            className="bg-surface-container border border-outline-variant p-4 outline-none focus:border-primary transition-colors text-sm md:text-base"
          >
            <option value="">Select time</option>
            {ARRIVAL_TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-caps text-[10px] uppercase tracking-widest text-outline">Special Requests / Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={4}
            className="bg-surface-container border border-outline-variant p-4 outline-none focus:border-primary transition-colors resize-none text-sm md:text-base"
            placeholder="e.g. Dietary requirements, surf level, or late check-in..."
          />
        </div>
      </div>
    </section>
  );
}
