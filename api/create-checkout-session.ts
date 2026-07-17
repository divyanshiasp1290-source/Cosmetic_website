import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:8080";
}

function json(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { success: false, error: "Method Not Allowed" });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  const metadata = {
    fullName: String(body.fullName ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    service: String(body.service ?? ""),
    date: String(body.date ?? ""),
    time: String(body.time ?? ""),
    notes: String(body.notes ?? ""),
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Dermacare Clinic Consultation Fee",
            },
            unit_amount: 2500,
          },
          quantity: 1,
        },
      ],
      success_url: `${getBaseUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/payment-cancel`,
      metadata,
    });

    return json(200, { url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return json(500, {
      success: false,
      error: error instanceof Error ? error.message : "Unable to create checkout session",
    });
  }
}