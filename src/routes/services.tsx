import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { services } from "@/components/site/data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Dermacare Clinic" },

      {
        name: "description",
        content:
          "Explore Dermacare Clinic's curated portfolio of medical-grade cosmetic dermatology and aesthetic treatments.",
      },
      { property: "og:title", content: "Services — Dermacare Clinic" },
      {
        property: "og:description",
        content: "A curated portfolio of medical-grade aesthetic treatments.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-10 lg:pt-36 lg:pb-12">
        <div className="absolute inset-0 -z-10 gradient-luxe" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="eyebrow">Treatments</div>
            <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              A curated portfolio of <em className="not-italic gradient-text">medical-grade</em>{" "}
              aesthetic artistry.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal/75">
              Each Dermacare Clinic treatment is composed with the same care as a couture fitting —
              precise, personal and quietly transformative.
            </p>
          </Reveal>

          <div className="mt-14 flex flex-wrap gap-2">
            {services.map((s) => (
              <a
                key={s.slug}
                href={`#${s.slug}`}
                className="rounded-full border border-border/70 bg-card/60 px-2 py-2 text-[0.69rem] leading-none tracking-wide text-charcoal/80 transition-colors hover:border-[var(--gold)] hover:text-[var(--rose)]"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE EDITORIAL */}
      <section className="mx-auto max-w-7xl px-6 pt-6 pb-16 lg:px-10 lg:pt-8">
        <div className="space-y-20">
          {services.map((s, i) => {
            const reverse = i % 2 === 1;
            return (
              <article id={s.slug} key={s.slug} className="scroll-mt-20">
                <div
                  className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}
                >
                  <Reveal>
                    <div className="img-zoom overflow-hidden rounded-[2rem] shadow-luxe max-h-[510px]">
                      <img
                        src={s.image}
                        alt={s.title}
                        loading="lazy"
                        className="max-h-[510px] w-full object-cover"
                      />
                    </div>
                  </Reveal>
                  <Reveal delay={120}>
                    <div className="eyebrow">Treatment · 0{(i % 9) + 1}</div>
                    <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                      {s.title}
                    </h2>
                    <p className="mt-3 font-serif text-xl italic text-[var(--rose)]">{s.short}</p>
                    <p className="mt-6 text-charcoal/75 leading-relaxed">{s.description}</p>

                    <div className="mt-8">
                      <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
                        Benefits
                      </p>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {s.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-charcoal/80">
                            <Check size={14} className="mt-1 shrink-0 text-[var(--gold)]" /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 rounded-2xl glass p-5">
                      <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
                        Expected Results
                      </p>
                      <p className="mt-2 text-sm text-charcoal/80">{s.result}</p>
                    </div>

                    <div className="mt-8">
                      <Link to="/booking" className="btn-gold">
                        Book {s.title} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] p-16 text-center shadow-luxe sm:p-24">
            <div className="absolute inset-0 -z-10" />
            <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-[oklch(0.18_0.005_60)] sm:text-5xl">
              Not sure where to begin? Let us compose your bespoke plan.
            </h2>
            <div className="mt-10">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--charcoal)] px-8 py-3.5 text-sm text-[var(--ivory)]"
              >
                Book a Consultation <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
