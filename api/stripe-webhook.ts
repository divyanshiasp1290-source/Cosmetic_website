import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export default async function handler(req: Request): Promise<Response> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ success: false, error: "Missing stripe-signature" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const rawBody = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getEnv("STRIPE_WEBHOOK_SECRET"),
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};

      const bookingPayload = {
        fullName: metadata.fullName ?? "",
        email: metadata.email ?? "",
        phone: metadata.phone ?? "",
        service: metadata.service ?? "",
        date: metadata.date ?? "",
        time: metadata.time ?? "",
        notes: metadata.notes ?? "",
        stripeSessionId: session.id,
      };

      const bookingResponse = await fetch(
        `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080"}/api/booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        },
      );

      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text().catch(() => "");
        throw new Error(`Booking confirmation failed: ${errorText}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}
