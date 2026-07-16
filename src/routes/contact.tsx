import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail, MapPin, Phone, Clock, Check } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/components/site/data";
import { WEB3FORMS_ACCESS_KEY } from "./web3forms";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Book a Dermacare Clinic Consultation" },

      {
        name: "description",
        content:
          "Reserve your private consultation at Dermacare Clinic — a refined cosmetic dermatology atelier in Beverly Hills.",
      },
      { property: "og:title", content: "Contact — Book a Dermacare Clinic Consultation" },

      {
        property: "og:description",
        content: "Reserve your private consultation at Dermacare Clinic.",
      },
    ],
  }),
  component: Contact,
});

const hours = [["Monday – Sunday", "10:00 AM – 6:00 PM"]];

function Contact() {
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const fullName = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim();
    const treatment = (form.elements.namedItem("service") as HTMLSelectElement).value;
    const skinStory = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!fullName) return setErrorMessage("Please enter your full name.");
    if (!email || !isEmailValid) return setErrorMessage("Please enter a valid email.");
    if (!phone) return setErrorMessage("Please enter your phone number.");
    if (!treatment) return setErrorMessage("Please select a treatment of interest.");
    if (!skinStory) return setErrorMessage("Please share your skin story.");

    setErrorMessage(null);

    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: fullName,
        email,
        phone,
        treatment,
        skin_story: skinStory,
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "Web3Forms submission failed");
      }

      setSent(true);
      form.reset();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to send form.");
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
              Get in touch <em className="not-italic gradient-text">with</em> Dermacare Clinic.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal/75">
              Your journey to healthier skin starts with a conversation. 
              Tell us how we can help, and we'll be happy to guide you through the next steps.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* FORM */}
          <Reveal className="lg:col-span-3">
            <div className="rounded-[2rem] bg-card p-10 shadow-luxe sm:p-12">
              <h2 className="font-serif text-3xl">Appointment Request</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill out the form below, and we'll get back to you to arrange your appointment.
              </p>

              {sent ? (
                <div className="mt-10 rounded-2xl glass p-10 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-gold">
                    <Check size={20} className="text-[oklch(0.18_0.005_60)]" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl">
                    Thank you! Your inquiry has been received. Our team will contact you soon.
                  </h3>
                </div>
              ) : (
                <>
                  {errorMessage ? (
                    <div className="mt-10 rounded-2xl glass p-6 text-center text-rose-600">
                      {errorMessage}
                    </div>
                  ) : null}

                  <form onSubmit={onSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
                    <Field label="Full Name" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                    <Field label="Phone" name="phone" type="tel" required />
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                        Treatment of Interest
                      </label>
                      <select
                        name="service"
                        required
                        className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal focus:border-[var(--gold)] focus:outline-none"
                      >
                        <option value="">Select treatment</option>
                        {services.map((s) => (
                          <option key={s.slug} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-2">
                      <label className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                        Your Skin Story
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        required
                        placeholder="Tell us a little about your skin and what you would love to achieve…"
                        className="rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-[var(--gold)] focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="btn-gold sm:col-span-2 mt-2">
                      Submit Inquiry <ArrowRight size={16} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>

          {/* INFO */}
          <Reveal delay={120} className="lg:col-span-2 space-y-6">
            {[
              {
                icon: MapPin,
                title: "Visit Our Clinic",
                lines: ["920 W King Edward Ave", "Vancouver, BC V5Z 2E2, Canada"],
              },
              { icon: Phone, title: "Speak with Us", lines: ["604 366 6820"] },
              { icon: Mail, title: "Write to Us", lines: ["info@dermacareclinic.ca"] },
            ].map((c) => (
              <div key={c.title} className="card-lift rounded-3xl glass p-7 shadow-soft">
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-gold">
                    <c.icon size={16} className="text-[oklch(0.2_0.005_60)]" />
                  </span>

                  <div>
                    <h3 className="font-serif text-xl">{c.title}</h3>

                    <div className="mt-2">
                      {c.lines.map((l) => (
                        <p key={l} className="text-sm text-charcoal/75">
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="card-lift rounded-3xl glass p-7 shadow-soft">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-gold">
                  <Clock size={16} className="text-[oklch(0.2_0.005_60)]" />
                </span>

                <div className="flex-1">
                  <h3 className="font-serif text-xl">Clinic Hours</h3>

                  <ul className="mt-4 space-y-3">
                    {hours.map(([d, h]) => (
                      <li key={d} className="flex items-center justify-between text-sm">
                        <span>{d}</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MAP */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] shadow-luxe">
            <iframe
              title="Map"
              className="h-[460px] w-full grayscale-[40%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=920+W+King+Edward+Ave,+Vancouver,+BC+V5Z+2E2,+Canada&output=embed"
            />
          </div>
        </Reveal>
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
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-charcoal focus:border-[var(--gold)] focus:outline-none"
      />
    </div>
  );
}
