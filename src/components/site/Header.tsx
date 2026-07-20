import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import logoImg from "@/assets/Logo.jpeg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const solid = scrolled || !isHome;

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "glass shadow-soft" : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logoImg}
            alt="Dermacare Clinic logo"
            width={58}
            height={58}
            className="h-14 w-14 rounded-full bg-[var(--ivory)] object-cover shadow-soft ring-1 ring-border/60"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg tracking-wide text-charcoal">Dermacare Clinic</span>
            <span className="text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground">
              Dermatology · Aesthetics
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative text-sm tracking-wide text-charcoal/80 transition-colors hover:text-charcoal"
              activeProps={{ className: "text-charcoal" }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[var(--gold)] to-[var(--rose)] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/booking" className="btn-gold">
            Book Consultation
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border/70 text-charcoal md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden flex justify-center">
          <div className="mb-4 rounded-2xl glass p-3 shadow-soft w-[70%] max-w-[450px]">
            <nav className="flex flex-col gap-2">
              {nav.map((item) => (
                <Link key={item.to} to={item.to} className="font-serif text-lg text-charcoal">
                  {item.label}
                </Link>
              ))}
              <Link to="/booking">Book Consultation</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
