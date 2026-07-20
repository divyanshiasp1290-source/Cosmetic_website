import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Award, Heart, ShieldCheck, Leaf, Star, Quote } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import clinic from "@/assets/homepage_DC.jpg";
import clientAvatar1 from "@/assets/client-avatar-1.jpg";
import clientAvatar2 from "@/assets/client-avatar-2.jpg";
import clientAvatar3 from "@/assets/client-avatar-3.jpg";
import clientAvatar4 from "@/assets/client-avatar-4.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/components/site/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dermacare Clinic" },
      {
        name: "description",
        content:
          "Reveal your most radiant skin. A medical-grade clinic offering cosmetic dermatology treatments in a refined, modern setting.",
      },
      { property: "og:title", content: "Dermacare Clinic" },
      {
        property: "og:description",
        content: "Medical-grade treatments crafted to enhance your natural radiance.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "2+", label: "Years of Expertise" },
  { value: "100+", label: "Devoted Clients" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "4", label: "Signature Treatments" },
];

const featured = [
  "microneedling",
  "hydrafacial",
  "chemical-peels",
  "ipl-treatments",
  "high-frequency-therapy",
  "face-sculpt",
];

const clientPortraits = [clientAvatar1, clientAvatar2, clientAvatar3, clientAvatar4];

const whyUs = [
  {
    icon: Award,
    title: "Specialist Expertise",
    text: "Experienced dermatologists dedicated to providing expert skin care.",
  },
  {
    icon: Heart,
    title: "Personalised Care",
    text: "Treatment plans tailored to your unique skin and goals.",
  },
  {
    icon: Sparkles,
    title: "Advanced Technology",
    text: "Modern, medical-grade technology for safe and effective treatments.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Procedures",
    text: "Every treatment is performed with your comfort and safety in mind.",
  },
  {
    icon: Leaf,
    title: "Naturally Beautiful",
    text: "Enhancing your natural beauty with subtle, balanced results.",
  },
];

const testimonials = [
  {
    name: "Michael P.",
    text: "DermaCare Clinic provides exceptional care and effective treatments that truly enhance your appearance.",
  },
  {
    name: "Jessica H.",
    text: "I experienced a significant improvement in my skin tone after treatment at DermaCare Clinic. Highly recommend their dedicated team for all aesthetic needs.",
  },

  {
    name: "Rachel W.",
    text: "The staff at DermaCare Clinic are professional, knowledgeable, and genuinely care about your results. My skin has never felt better!",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt=""
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--ivory)] via-[color-mix(in_oklab,var(--ivory)_75%,transparent)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ivory)] via-transparent to-transparent" />
        </div>
        <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-6 pt-24 pb-20 lg:px-10">
          <div className="max-w-2xl animate-[fade-up_1.1s_ease-out_both]">
            <div className="eyebrow">Cosmetic Dermatology</div>
            <h1 className="mt-8 font-serif text-5xl leading-[1.05] tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
              Healthy, <em className="not-italic gradient-text">Beautiful Skin</em> Starts Here.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-charcoal/75 sm:text-lg">
              Beautiful skin isn't about changing who you are—it's about feeling your best. Our
              personalised cosmetic dermatology treatments are designed to enhance your natural
              features with expert care and subtle, natural-looking results.
            </p>
            <div className="mt-10 grid max-w-md gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <Link to="/booking" className="btn-gold w-full sm:w-auto">
                Book Consultation <ArrowRight size={16} />
              </Link>
              <Link to="/services" className="btn-ghost w-full sm:w-auto">
                Explore Services
              </Link>
            </div>

            <div className="mt-14 grid gap-3 sm:flex sm:items-center sm:gap-6">
              <div className="flex -space-x-2">
                {clientPortraits.map((portrait, i) => (
                  <img
                    key={portrait}
                    src={portrait}
                    alt={`Dermacare client portrait ${i + 1}`}
                    width={72}
                    height={72}
                    className="h-9 w-9 rounded-full border-2 border-[var(--ivory)] object-cover shadow-soft"
                  />
                ))}
              </div>
              <div className="min-w-0 text-xs text-charcoal/70">
                <div className="flex items-center gap-1 text-[var(--gold)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <p className="mt-1 leading-relaxed">Trusted by 100+ refined clients worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative mx-auto -mt-20 max-w-7xl px-6 lg:px-10">
        <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl glass shadow-luxe lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-[color-mix(in_oklab,white_70%,transparent)] p-10 text-center"
            >
              <div className="font-serif text-4xl gradient-text lg:text-5xl">{s.value}</div>
              <div className="mt-3 text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* FEATURED SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <Reveal>
            <div className="eyebrow">Signature Treatments</div>
            <h2 className="mt-6 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              Expert Care. <em className="not-italic gradient-text">Personalised Treatments.</em>{" "}
              Natural Results.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <Link to="/services" className="btn-ghost">
              View all services <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((slug, i) => {
            const s = services.find((x) => x.slug === slug)!;
            return (
              <Reveal key={s.slug} delay={i * 80}>
                <article className="card-lift group relative overflow-hidden rounded-3xl bg-card shadow-soft">
                  <div className="img-zoom aspect-[4/5.2] overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <div className="rounded-2xl glass p-6">
                      <h3 className="font-serif text-2xl">{s.title}</h3>
                      <p className="mt-2 text-sm text-charcoal/75">{s.short}</p>
                      <Link
                        to="/services"
                        hash={s.slug}
                        className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[var(--rose)]"
                      >
                        Discover <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative overflow-hidden bg-[color-mix(in_oklab,var(--blush)_55%,var(--ivory))] py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <div className="img-zoom overflow-hidden rounded-[2rem] shadow-luxe">
              <img
                src={clinic}
                alt="Dermacare Clinic interior"
                loading="lazy"
                width={1400}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="eyebrow">Why Dermacare Clinic</div>
            <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
              Expert Care <em className="not-italic gradient-text">You Can</em> Trust
            </h2>
            <p className="mt-5 max-w-lg text-charcoal/75">
              We believe great skin starts with expert care and a personalised approach. Every
              treatment is carefully planned to suit your skin, your concerns, and your
              goals—helping you achieve healthy, natural-looking results you can feel confident in.
            </p>
            <ul className="mt-10 space-y-6">
              {whyUs.map((w) => (
                <li key={w.title} className="flex gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full gradient-gold shadow-soft">
                    <w.icon size={18} className="text-[oklch(0.2_0.005_60)]" />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl">{w.title}</h3>
                    <p className="mt-1 text-sm text-charcoal/70">{w.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 -z-10 gradient-luxe opacity-70" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="text-center">
            <div className="eyebrow justify-center">Devoted Voices</div>
            <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
              Stories whispered from those who <em className="not-italic gradient-text">glow</em>{" "}
              with us.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <article className="card-lift rounded-3xl bg-card p-9 shadow-soft">
                  <Quote className="text-[var(--gold)]" size={28} />
                  <p className="mt-5 font-serif text-xl leading-relaxed text-charcoal/85">
                    "{t.text}"
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-base">{t.name}</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
                    <div className="flex gap-0.5 text-[var(--gold)]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={12} fill="currentColor" stroke="none" />
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] p-16 text-center shadow-luxe sm:p-24">
            <div className="absolute inset-0 -z-10" />
            <div
              className="absolute inset-0 -z-10 opacity-30 mix-blend-soft-light"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 40%)",
              }}
            />
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[oklch(0.2_0.01_60)]/70">
              Begin your ritual
            </p>
            <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight text-[oklch(0.18_0.005_60)] sm:text-5xl lg:text-6xl">
              Your most radiant skin is waiting to be revealed.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[oklch(0.22_0.005_60)]/75">
              Book a consultation with our specialists, and we'll create a personalised treatment
              plan based on your skin, concerns, and goals.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--charcoal)] px-8 py-3.5 text-sm tracking-wide text-[var(--ivory)] transition hover:translate-y-[-2px]"
              >
                Book Consultation <ArrowRight size={16} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.2_0.005_60)]/30 px-8 py-3.5 text-sm text-[oklch(0.18_0.005_60)] transition hover:border-[oklch(0.2_0.005_60)]/60"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
