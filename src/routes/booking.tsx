import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, type FormEvent } from "react";
import { ArrowRight, Mail, MapPin, Phone, Clock, Check, CreditCard, Calendar } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/components/site/data";
import {
  getClinicDates,
  getMinBookingDate,
  isBookingDateAllowed,
  isValidPhoneNumber,
  formatPhoneNumber,
  isWithinServiceArea,
  formatPostalCode,
  CLINIC_TIME_SLOTS,
  formatTimeSlotLabel,
} from "@/lib/validation";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book Consultation | Dermacare Clinic" },
      {
        name: "description",
        content:
          "Book your consultation at Dermacare Clinic. Select your preferred service, date, and time, and our team will confirm your appointment within one business day.",
      },
      {
        property: "og:title",
        content: "Book Consultation | Dermacare Clinic",
      },
      {
        property: "og:description",
        content:
          "Schedule your consultation with Dermacare Clinic. Choose your preferred service, date, and time for a personalized skincare experience.",
      },
    ],
  }),
  component: Booking,
});

const hours = [["Monday – Sunday", "10:00 AM – 18:00 PM"]];

function Booking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"stripe" | "skip">("stripe");
  const [isConfirmedAtClinic, setIsConfirmedAtClinic] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState<{
    fullName: string;
    email: string;
    phone: string;
    postalCode: string;
    service: string;
    date: string;
    time: string;
    notes: string;
  } | null>(null);

  const [availabilitySlots, setAvailabilitySlots] = useState<
    Array<{ time: string; label: string; available: boolean }> | null
  >(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const minBookingDate = useMemo(() => getMinBookingDate(), []);
  const clinicSlots = useMemo(
    () =>
      CLINIC_TIME_SLOTS.map((t) => ({
        time: t,
        label: formatTimeSlotLabel(t),
        available: true,
      })),
    [],
  );

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
  const isStripeConfigured = Boolean(stripePublishableKey);

  const fetchAvailability = async (date: string) => {
    if (!date || !isBookingDateAllowed(date)) {
      setAvailabilitySlots(null);
      setAvailabilityError(null);
      setIsLoadingAvailability(false);
      return;
    }

    setIsLoadingAvailability(true);
    setAvailabilityError(null);

    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Unable to check appointment availability.");
      }

      const slots: Array<{ time: string; label: string; available: boolean }> =
        data.slots || [];
      setAvailabilitySlots(slots);

      // If currently selected time is booked on this date, clear it
      setSelectedTime((currentSelectedTime) => {
        if (!currentSelectedTime) return "";
        const matched = slots.find((s) => s.time === currentSelectedTime);
        return matched && matched.available ? currentSelectedTime : "";
      });
    } catch (err) {
      console.error("[availability] fetch error:", err);
      setAvailabilityError(
        err instanceof Error ? err.message : "Unable to load time slot availability.",
      );
      setAvailabilitySlots(null);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (selectedDate && isBookingDateAllowed(selectedDate)) {
      fetchAvailability(selectedDate);
    } else {
      setAvailabilitySlots(null);
      setAvailabilityError(null);
      setIsLoadingAvailability(false);
    }
  }, [selectedDate]);

  const onDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedTime("");
    if (newDate && !isBookingDateAllowed(newDate)) {
      setErrorMessage(
        "Appointments cannot be booked for today. Please select tomorrow or a later date.",
      );
    } else {
      setErrorMessage(null);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const data = {
      fullName: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      postalCode: (
        (form.elements.namedItem("postalCode") as HTMLInputElement)?.value || postalCode
      ).trim(),
      service: (form.elements.namedItem("service") as HTMLSelectElement).value,
      date: selectedDate,
      time: selectedTime,
      notes: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

    if (!isValidPhoneNumber(data.phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    const serviceAreaCheck = isWithinServiceArea(data.postalCode);
    if (!serviceAreaCheck.isEligible) {
      setErrorMessage(
        serviceAreaCheck.message ||
          "Dermacare Clinic serves clients within ~20 km of our Vancouver atelier (920 W King Edward Ave).",
      );
      return;
    }

    if (!isBookingDateAllowed(data.date)) {
      setErrorMessage(
        "Appointments cannot be booked for today. Please select tomorrow or a later date.",
      );
      return;
    }

    if (!data.time) {
      setErrorMessage("Please select an available appointment time slot.");
      return;
    }

    const selectedSlotObj = availabilitySlots?.find((s) => s.time === data.time);
    if (selectedSlotObj && !selectedSlotObj.available) {
      setErrorMessage("The selected time slot is already booked. Please choose an available time slot.");
      return;
    }

    data.phone = formatPhoneNumber(data.phone);
    data.postalCode = formatPostalCode(data.postalCode);
    setErrorMessage(null);

    // OPTION 1: "Skip" -> Directly confirms via /api/booking without Stripe
    if (paymentOption === "skip") {
      try {
        setIsSubmitting(true);

        const response = await fetch("/api/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            paymentStatus: "skip",
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || "Unable to confirm your booking. Please try again.");
        }

        setConfirmedDetails(data);
        setIsConfirmedAtClinic(true);
        setIsSubmitting(false);

        // Refresh calendar availability for the selected date
        if (data.date) {
          void fetchAvailability(data.date);
        }
        return;
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "Unable to complete booking. Please try again.";
        setErrorMessage(message);
        setIsSubmitting(false);
        return;
      }
    }

    // OPTION 2: "Pay $25 & Confirm Appointment" -> Stripe Hosted Checkout
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || "Unable to create checkout session.");
      }

      window.localStorage.setItem("pendingBooking", JSON.stringify(data));

      // Navigate immediately; prevent any further state updates that can race with navigation.
      window.location.assign(result.url as string);
      return;
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unable to start checkout. Please try again.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36">
        <div className="absolute inset-0 -z-10 gradient-luxe" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="eyebrow">Reserve Your Consultation</div>
            <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Begin your <em className="not-italic gradient-text">ritual</em> at Dermacare Clinic.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal/75">
              Choose your preferred service, date, and time to request your appointment. Our team
              will review your request and contact you within one business day to confirm your
              booking.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="rounded-[2rem] bg-card p-10 shadow-luxe sm:p-12">
          {/* CONFIRMATION STATE (Skip success) */}
          {isConfirmedAtClinic && confirmedDetails ? (
            <div className="py-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gradient-gold text-[oklch(0.18_0.005_60)] mb-6 shadow-md">
                <Check size={28} />
              </div>
              <div className="eyebrow">Consultation Reserved</div>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-charcoal">
                Booking Confirmed!
              </h2>
              <p className="mt-4 text-base text-charcoal/80 max-w-xl mx-auto leading-relaxed">
                Thank you, <strong className="text-charcoal">{confirmedDetails.fullName}</strong>. Your consultation has been reserved and scheduled on our clinic calendar.
              </p>

              <div className="mt-8 mx-auto max-w-lg rounded-2xl border border-border bg-background/70 p-6 text-left shadow-sm">
                <div className="grid gap-3.5 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2.5">
                    <span className="text-muted-foreground uppercase text-[0.7rem] tracking-wider font-semibold">Service</span>
                    <span className="font-medium text-charcoal">{confirmedDetails.service}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2.5">
                    <span className="text-muted-foreground uppercase text-[0.7rem] tracking-wider font-semibold">Date & Time</span>
                    <span className="font-medium text-charcoal">
                      {confirmedDetails.date} at {formatTimeSlotLabel(confirmedDetails.time)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2.5">
                    <span className="text-muted-foreground uppercase text-[0.7rem] tracking-wider font-semibold">Contact Phone</span>
                    <span className="font-medium text-charcoal">{confirmedDetails.phone}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-muted-foreground uppercase text-[0.7rem] tracking-wider font-semibold">Status</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-900 border border-emerald-500/25">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-muted/40 p-4 max-w-lg mx-auto text-xs text-muted-foreground leading-relaxed">
                📍 <strong>Vancouver Clinic:</strong> 920 W King Edward Ave, Vancouver, BC. Please arrive 5–10 minutes before your scheduled appointment.
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmedAtClinic(false);
                    setConfirmedDetails(null);
                    setSelectedTime("");
                  }}
                  className="btn-gold w-full sm:w-auto"
                >
                  Book Another Appointment
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium text-charcoal hover:bg-muted/30 transition-all text-center"
                >
                  Return Home
                </Link>
              </div>
            </div>
          ) : isSubmitting ? (
            <div className="mt-6 rounded-2xl glass p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-gold">
                <Check size={20} className="text-[oklch(0.18_0.005_60)]" />
              </div>
              <h3 className="mt-6 font-serif text-2xl">
                {paymentOption === "stripe"
                  ? "Redirecting to secure checkout…"
                  : "Confirming your appointment…"}
              </h3>
              <p className="mt-3 text-sm text-charcoal/70">
                {paymentOption === "stripe"
                  ? "You will be taken to Stripe to complete the $25 consultation payment."
                  : "Reserving your time slot and scheduling in our calendar."}
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-3xl">Book Consultation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose your preferred service, date and time. We will confirm your appointment within
                one business day.
              </p>

              <form onSubmit={onSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" name="name" required />

                <Field label="Email" name="email" type="email" required />

                <Field label="Phone" name="phone" type="tel" required />

                <Field
                  label="Postal Code (Greater Vancouver Area)"
                  name="postalCode"
                  placeholder="e.g. V5Z 2E2"
                  required
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    setErrorMessage(null);
                  }}
                />

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="service"
                    className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground"
                  >
                    Service *
                  </label>

                  <select
                    id="service"
                    name="service"
                    required
                    title="Service"
                    aria-label="Service"
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal focus:border-[var(--gold)] focus:outline-none"
                  >
                    <option value="">Select Service</option>
                    <option>Microneedling</option>
                    <option>Chemical Peel</option>
                    <option>IPL Treatments</option>
                    <option>Laser Hair Removal</option>
                    <option>Hydrafacial</option>
                    <option>High-Frequency Therapy</option>
                    <option>Microdermabrasion</option>
                    <option>Face Sculpt</option>
                    <option>Dermaplaning</option>
                    <option>LED Light Therapy</option>
                  </select>
                </div>

                <Field
                  label="Date"
                  name="date"
                  type="date"
                  required
                  min={minBookingDate}
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                />

                {/* SELECTABLE APPOINTMENT TIME SLOTS */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                      Appointment Time Slot *
                    </label>
                    {selectedTime && (
                      <span className="text-xs font-medium text-[var(--gold)]">
                        Selected: {formatTimeSlotLabel(selectedTime)}
                      </span>
                    )}
                  </div>

                  <input type="hidden" name="time" value={selectedTime} />

                  {!selectedDate ? (
                    <div className="rounded-xl border border-dashed border-border/80 bg-background/50 p-6 text-center text-sm text-muted-foreground">
                      Please select an appointment date above to view available time slots.
                    </div>
                  ) : !isBookingDateAllowed(selectedDate) ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-center text-sm font-medium text-rose-700">
                      Appointments cannot be booked for today. Please select tomorrow or a later date.
                    </div>
                  ) : isLoadingAvailability ? (
                    <div className="rounded-xl border border-dashed border-border/80 bg-background/50 p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2.5">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
                      <span>Checking clinic schedule for {selectedDate}…</span>
                    </div>
                  ) : availabilityError ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-center text-sm font-medium text-rose-700 flex flex-col items-center gap-2">
                      <span>{availabilityError}</span>
                      <button
                        type="button"
                        onClick={() => fetchAvailability(selectedDate)}
                        className="text-xs font-semibold underline text-rose-800 hover:text-rose-950 transition-colors"
                      >
                        Retry Availability
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {(availabilitySlots || clinicSlots).map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        const isBooked = !slot.available;

                        if (isBooked) {
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled
                              aria-disabled="true"
                              title="This appointment slot is already booked"
                              className="flex flex-col items-center justify-center rounded-xl py-3 px-2 text-sm font-medium border border-border/50 bg-muted/40 text-muted-foreground/50 cursor-not-allowed opacity-60 transition-all select-none"
                            >
                              <span className="line-through">{slot.label}</span>
                              <span className="mt-0.5 text-[0.65rem] uppercase tracking-wider font-semibold text-rose-600/80">
                                Booked
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot.time);
                              setErrorMessage(null);
                            }}
                            className={`flex flex-col items-center justify-center rounded-xl py-3 px-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-[oklch(0.25_0.02_60)] text-white shadow-md ring-2 ring-[var(--gold)] ring-offset-2"
                                : "border border-border bg-background text-charcoal hover:border-[var(--gold)] hover:bg-[var(--sand)]/30"
                            }`}
                          >
                            <span>{slot.label}</span>
                            <span
                              className={`mt-0.5 text-[0.65rem] uppercase tracking-wider ${
                                isSelected
                                  ? "text-[var(--gold)] font-semibold"
                                  : "text-emerald-600 font-medium"
                              }`}
                            >
                              {isSelected ? "Selected" : "Available"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Dermacare Clinic serves clients within approximately 20 km of our Vancouver
                    atelier (920 W King Edward Ave). Bookings can be made starting tomorrow onward.
                  </p>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                    Additional Notes
                  </label>

                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Any additional information..."
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                {errorMessage ? (
                  <div className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-center text-sm font-medium text-rose-700">
                    {errorMessage}
                  </div>
                ) : null}

                {/* SUBMIT BUTTON & PAYMENT LINK */}
                <div className="sm:col-span-2 flex flex-col items-center gap-2 mt-2">
                  {paymentOption === "stripe" ? (
                    <>
                      <button
                        type="submit"
                        className="btn-gold w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSubmitting || !isStripeConfigured}
                        title={isStripeConfigured ? undefined : "Stripe is not configured yet"}
                      >
                        Pay $25 & Confirm Appointment <ArrowRight size={16} />
                      </button>
                      <p className="text-center text-xs text-muted-foreground">
                        or{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentOption("skip");
                            setErrorMessage(null);
                          }}
                          className="underline hover:text-charcoal transition-colors cursor-pointer"
                        >
                          Skip
                        </button>
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="btn-gold w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSubmitting}
                      >
                        Confirm Appointment <Check size={16} />
                      </button>
                      <p className="text-center text-xs text-muted-foreground">
                        or{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentOption("stripe");
                            setErrorMessage(null);
                          }}
                          className="underline hover:text-charcoal transition-colors cursor-pointer"
                        >
                          Pay $25 Advance
                        </button>
                      </p>
                    </>
                  )}
                </div>

                <p className="sm:col-span-2 text-center text-xs text-muted-foreground mt-0.5">
                  By booking, you agree to Dermacare Clinic&apos;s{" "}
                  <Link
                    to="/privacy-policy"
                    className="underline hover:text-charcoal transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  min,
  max,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputId = name;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground"
      >
        {label}
        {required && " *"}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        required={required}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal focus:border-[var(--gold)] focus:outline-none"
      />
    </div>
  );
}
