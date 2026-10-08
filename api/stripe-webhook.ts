import Stripe from "stripe";

function getBaseUrl(req?: any): string {
  if (req) {
    const host =
      (typeof req.headers?.get === "function"
        ? req.headers.get("x-forwarded-host") || req.headers.get("host")
        : null) ||
      req.headers?.["x-forwarded-host"] ||
      req.headers?.host;

    if (host) {
      const proto =
        (typeof req.headers?.get === "function" ? req.headers.get("x-forwarded-proto") : null) ||
        req.headers?.["x-forwarded-proto"] ||
        "https";
      return `${proto}://${host}`;
    }
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://www.dermacareclinic.ca";
}

function json(status: number, payload: Record<string, unknown>, res?: any): Response {
  if (res && typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(payload);
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function getRawBody(req: any): Promise<string> {
  if (req && typeof req.text === "function") {
    return await req.text();
  }
  if (req && req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      return req.body.toString("utf8");
    }
    if (typeof req.body === "string") {
      return req.body;
    }
    return JSON.stringify(req.body);
  }
  return "";
}

function getHeader(req: any, headerName: string): string | null {
  if (!req || !req.headers) return null;
  if (typeof req.headers.get === "function") {
    return req.headers.get(headerName);
  }
  return req.headers[headerName.toLowerCase()] ?? req.headers[headerName] ?? null;
}

export default async function handler(
  req: Request | { method?: string; headers?: any; body?: any; text?: () => Promise<string> },
  res?: any,
): Promise<Response> {
  const method = (req?.method ?? "POST").toUpperCase();
  if (method !== "POST") {
    return json(405, { success: false, error: "Method Not Allowed" }, res);
  }

  const signature = getHeader(req, "stripe-signature");
  if (!signature) {
    return json(400, { success: false, error: "Missing stripe-signature header" }, res);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey) {
    console.error("[stripe-webhook] Missing STRIPE_SECRET_KEY");
    return json(500, { success: false, error: "Missing STRIPE_SECRET_KEY" }, res);
  }

  const stripe = new Stripe(secretKey);

  try {
    const rawBody = await getRawBody(req);
    const event = webhookSecret
      ? stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      : (JSON.parse(rawBody) as Stripe.Event);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};

      const bookingPayload = {
        fullName: metadata.fullName ?? "",
        email: metadata.email ?? "",
        phone: metadata.phone ?? "",
        postalCode: metadata.postalCode ?? "",
        service: metadata.service ?? "",
        date: metadata.date ?? "",
        time: metadata.time ?? "",
        notes: metadata.notes ?? "",
        stripeSessionId: session.id,
      };

      const baseUrl = getBaseUrl(req);
      const bookingResponse = await fetch(`${baseUrl}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text().catch(() => "");
        throw new Error(`Booking confirmation failed: ${errorText}`);
      }
    }

    return json(200, { received: true }, res);
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return json(
      400,
      { success: false, error: error instanceof Error ? error.message : "Webhook error" },
      res,
    );
  }
}
