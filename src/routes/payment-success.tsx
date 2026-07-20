import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/payment-success")({
  component: PaymentSuccess,
});

type BookingPayload = {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
};

function PaymentSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your appointment…");

  useEffect(() => {
    let isMounted = true;

    const finalizeBooking = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get("session_id") ?? "";
        const completedSessions = window.localStorage.getItem("completedStripeSessions");
        const completedSessionIds = completedSessions
          ? (JSON.parse(completedSessions) as string[])
          : [];

        if (sessionId && completedSessionIds.includes(sessionId)) {
          if (isMounted) {
            setStatus("success");
            setMessage("Your consultation was already confirmed.");
          }
          return;
        }

        const pendingBookingRaw = window.localStorage.getItem("pendingBooking");
        const pendingBooking = pendingBookingRaw
          ? (JSON.parse(pendingBookingRaw) as BookingPayload)
          : null;

        if (!pendingBooking) {
          throw new Error("No pending booking found.");
        }

        const response = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pendingBooking,
            stripeSessionId: sessionId || undefined,
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || "Unable to confirm your appointment.");
        }

        if (sessionId) {
          window.localStorage.setItem(
            "completedStripeSessions",
            JSON.stringify([
              ...completedSessionIds.filter((item) => item !== sessionId),
              sessionId,
            ]),
          );
        }

        if (isMounted) {
          setStatus("success");
          setMessage("Your consultation is confirmed. We’ll be in touch shortly.");
          window.localStorage.removeItem("pendingBooking");
          window.setTimeout(() => {
            window.location.href = "/";
          }, 2500);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setStatus("error");
          setMessage(
            error instanceof Error ? error.message : "Unable to confirm your appointment.",
          );
          window.localStorage.removeItem("pendingBooking");
        }
      }
    };

    void finalizeBooking();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-24 lg:px-10">
        <div className="w-full rounded-[2rem] bg-card p-10 text-center shadow-luxe sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--gold)_20%,white)] text-[var(--gold)]">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-8 font-serif text-4xl">
            {status === "success"
              ? "Appointment Confirmed"
              : status === "error"
                ? "Payment Received"
                : "Processing Your Booking"}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/70">{message}</p>
          <div className="mt-8 flex justify-center">
            <Link to="/" className="btn-gold">
              Return Home
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
