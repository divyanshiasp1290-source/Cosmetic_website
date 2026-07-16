import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

import logoImg from "@/assets/Logo.jpeg";


export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border/60 bg-[var(--ivory)]">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-6 text-center lg:text-left lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2 max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Dermacare Clinic logo"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full bg-[var(--ivory)] object-cover shadow-soft ring-1 ring-border/60"

            />
            <span className="font-serif text-2xl">Dermacare Clinic</span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Providing personalised dermatology and aesthetic treatments to help you achieve healthy, confident, and naturally beautiful skin.
          </p>
        </div>

        <div>
          <div className="eyebrow">Explore</div>
          <ul className="mt-5 space-y-3 text-sm text-charcoal/80">
            {[
              ["/", "Home"],
              ["/about", "About"],
              ["/services", "Services"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-[var(--rose)]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow">Atelier</div>
          <ul className="mt-5 space-y-3 text-sm text-charcoal/80">
            <li className="flex items-start gap-2 justify-center lg:justify-start">
              <MapPin size={22} className="lg:mt-1 text-[var(--gold)]" />
              <span className="text-center lg:text-left">
                920 W King Edward Ave, Vancouver, BC, V5Z 2E2, Canada
              </span>
            </li>
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <Phone size={14} className="text-[var(--gold)]" />
              <span className="text-center lg:text-left">604 366 6820</span>
            </li>
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <Mail size={14} className="text-[var(--gold)]" />
              <span className="text-center lg:text-left">info@dermacareclinic.ca</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-6 py-2 text-xs text-muted-foreground lg:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Dermacare Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
