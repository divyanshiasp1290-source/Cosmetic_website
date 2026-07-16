import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/payment-cancel")({
  component: PaymentCancel,
});

function PaymentCancel() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-24 lg:px-10">
        <div className="w-full rounded-[2rem] bg-card p-10 text-center shadow-luxe sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--rose)_20%,white)] text-[var(--rose)]">
            <XCircle size={32} />
          </div>
          <h1 className="mt-8 font-serif text-4xl">Payment Cancelled</h1>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
            Your appointment has not been booked. No charges were made.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/booking" className="btn-gold">
              Try Again
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
