import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail, MapPin, Phone, Clock, Check } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/components/site/data";

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
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
  const isStripeConfigured = Boolean(stripePublishableKey);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const data = {
      fullName: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      service: (form.elements.namedItem("service") as HTMLSelectElement).value,
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
      time: (form.elements.namedItem("time") as HTMLInputElement).value,
      notes: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

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
      alert("Unable to start checkout. Please try again.");
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
        {/* FORM */}

        <div className="rounded-[2rem] bg-card p-10 shadow-luxe sm:p-12">
          <h2 className="font-serif text-3xl">Book Consultation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your preferred service, date and time. We will confirm your appointment within
            one business day.
          </p>

          {isSubmitting ? (
            <div className="mt-10 rounded-2xl glass p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-gold">
                <Check size={20} className="text-[oklch(0.18_0.005_60)]" />
              </div>
              <h3 className="mt-6 font-serif text-2xl">Redirecting to secure checkout…</h3>
              <p className="mt-3 text-sm text-charcoal/70">
                You will be taken to Stripe to complete the $25 consultation payment.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" name="name" required />

              <Field label="Email" name="email" type="email" required />

              <Field label="Phone" name="phone" type="tel" required />

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
                  <option>LED Light Therapyn</option>
                </select>
              </div>

              <Field label="Date" name="date" type="date" required />

              <Field label="Time" name="time" type="time" required />

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                  Additional Notes
                </label>

                <textarea
                  name="message"
                  rows={5}
                  placeholder="Any additional information..."
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-gold sm:col-span-2 mt-2 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting || !isStripeConfigured}
                title={isStripeConfigured ? undefined : "Stripe is not configured yet"}
              >
                Pay $25 & Confirm Appointment <ArrowRight size={16} />
              </button>
            </form>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  const inputId = name;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
        {required && " *"}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        required={required}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal focus:border-[var(--gold)] focus:outline-none"
      />
    </div>
  );
}
