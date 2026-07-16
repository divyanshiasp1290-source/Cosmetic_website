import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Heart, Sparkles, Leaf, ShieldCheck, Gem } from "lucide-react";
import clinic from "@/assets/clinic-interior.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Dermacare Clinic" },

      {
        name: "description",
        content:
          "Our story, our specialists and the philosophy that shapes every Dermacare Clinic experience.",
      },
      { property: "og:title", content: "About — Dermacare Clinic" },

      {
        property: "og:description",
        content: "Our story, our specialists and the philosophy of quiet luxury.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Gem,
    title: "Expertise",
    text: "Providing trusted dermatology care backed by experience and knowledge.",
  },
  {
    icon: Heart,
    title: "Personalised Care",
    text: "Every treatment is tailored to your skin, concerns, and goals.",
  },
  {
    icon: ShieldCheck,
    title: "Safety",
    text: "Your comfort and safety are at the heart of every treatment we provide.",
  },
  {
    icon: Leaf,
    title: "Natural Results",
    text: "We focus on enhancing your natural beauty with healthy, balanced results.",
  },
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36">
        <div className="absolute inset-0 -z-10 gradient-luxe" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="eyebrow">Our Atelier</div>
            <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Expert Care. <em className="not-italic gradient-text">Personalised</em> for You.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal/75">
              At Dermacare Clinic, we're passionate about helping you feel confident in your skin. Every treatment begins with understanding your needs, so we can create a personalised plan that delivers safe, effective, and natural-looking results.
            </p>
          </Reveal>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="img-zoom overflow-hidden rounded-[2rem] shadow-luxe">
              <img
                src={clinic}
                alt="Lumière atelier"
                loading="lazy"
                width={1400}
                height={1000}
                className="w-full"
              />
            </div>
          </Reveal>
          <Reveal delay={120} className="self-center">
            <div className="eyebrow">Our Story</div>
            <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
              A quieter approach to <em className="not-italic gradient-text">beauty</em>.
            </h2>
            <div className="mt-6 space-y-5 text-charcoal/75">
              <p>
                At Dermacare Clinic, we believe everyone deserves to feel confident in their skin. 
                Since 2008, we've been providing personalised dermatology and aesthetic treatments with a focus on expert care, 
                honest advice, and natural-looking results.
              </p>
              <p>
                Over the years, we've helped countless patients achieve healthier skin through advanced treatments 
                tailored to their individual needs. Our experienced team is committed to creating a welcoming environment 
                where every patient feels heard, supported, and cared for.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            {
              eyebrow: "Mission",
              title: "Helping You Feel Confident in Your Skin",
              text: "Our mission is to provide expert dermatology and aesthetic care that's personalised to your unique needs. We combine advanced treatments with compassionate care to help you achieve healthy, natural-looking results in a comfortable and welcoming environment.",
            },
            {
              eyebrow: "Vision",
              title: "Confidence Through Healthy Skin",
              text: "We strive to create a place where every patient feels welcomed, supported, and cared for. By combining expertise with the latest treatments, we aim to help people achieve healthy, natural-looking skin that lasts.",
            },
          ].map((b, i) => (
            <Reveal key={b.eyebrow} delay={i * 120}>
              <div className="card-lift h-full rounded-[2rem] glass p-12 shadow-soft">
                <div className="eyebrow">{b.eyebrow}</div>
                <h3 className="mt-6 font-serif text-3xl leading-tight">{b.title}</h3>
                <p className="mt-5 text-charcoal/75">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
          <div className="eyebrow">Our Values</div>
          <h2 className="mt-6 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            The Values That <em className="not-italic gradient-text">Shape Our Care</em>.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <div className="card-lift h-full rounded-3xl bg-card p-8 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-full gradient-gold">
                  <v.icon size={18} className="text-[oklch(0.2_0.005_60)]" />
                </span>
                <h3 className="mt-6 font-serif text-xl">{v.title}</h3>
                <p className="mt-2 text-sm text-charcoal/70">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <Reveal>
          <div className="rounded-[2.5rem] glass p-12 text-center shadow-luxe sm:p-16">
            <div className="eyebrow justify-center">Trusted Excellence</div>
            <div className="mt-10 grid gap-10 md:grid-cols-4">
              {[
                { n: "2+", l: "Years of practice" },
                { n: "100+", l: "Refined clients" },
                { n: "4", l: "Signature treatments" },
                { n: "100%", l: "Medical-grade safety" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-4xl gradient-text">{s.n}</div>
                  <div className="mt-2 text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link to="/booking" className="btn-gold">
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
