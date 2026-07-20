import Stripe from "stripe";

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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms: ${label}`));
    }, ms);

    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export default async function handler(req: Request): Promise<Response> {
  console.log("[create-checkout-session] handler start", {
    method: req.method,
    url: req.url,
  });

  // Global request watchdog to prevent Pending forever.
  const watchdogMs = Number(process.env.CHECKOUT_ENDPOINT_WATCHDOG_MS ?? 25000);

  // Stripe calls can sometimes hang behind certain network/proxy setups.
  // Force the whole handler to resolve with a JSON Response.
  // Keep logic identical otherwise.
  try {
    return await withTimeout(
      (async () => {
        if (req.method !== "POST") {
          console.log("[create-checkout-session] method not allowed");
          return json(405, { success: false, error: "Method Not Allowed" });
        }

        console.log("[create-checkout-session] about to parse JSON body");
        let body: Record<string, unknown>;
        try {
          body = (await withTimeout(req.json() as Promise<unknown>, 5000, "req.json()")) as Record<
            string,
            unknown
          >;
          console.log("[create-checkout-session] parsed JSON body ok", Object.keys(body ?? {}));
        } catch (err) {
          console.error("[create-checkout-session] req.json() failed", err);
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

        console.log("[create-checkout-session] initializing Stripe client");
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
          console.error("[create-checkout-session] Missing STRIPE_SECRET_KEY");
          return json(500, {
            success: false,
            error: "Server misconfigured: missing STRIPE_SECRET_KEY",
          });
        }

        // Stripe constructor is sync, but keep logs to pinpoint where execution stops.
        const stripe = new Stripe(stripeSecretKey);
        console.log("[create-checkout-session] Stripe client initialized");

        console.log("[create-checkout-session] about to create Stripe checkout session");
        const createPromise = stripe.checkout.sessions.create({
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

        const session = await withTimeout(
          createPromise,
          Number(process.env.CHECKOUT_STRIPE_CREATE_TIMEOUT_MS ?? 15000),
          "stripe.checkout.sessions.create",
        );

        console.log("[create-checkout-session] Stripe session created", {
          id: session?.id,
          url: session?.url,
        });

        if (!session?.url) {
          console.error("[create-checkout-session] Stripe returned no session.url");
          return json(500, { success: false, error: "Stripe session missing url" });
        }

        return json(200, { url: session.url });
      })(),
      watchdogMs,
      "create-checkout-session handler watchdog",
    );
  } catch (error) {
    console.error("[create-checkout-session] handler failed (watchdog/catch)", error);

    // Always return a Response on failure.
    return json(500, {
      success: false,
      error: error instanceof Error ? error.message : "Unable to create checkout session",
    });
  } finally {
    console.log("[create-checkout-session] handler end");
  }
}
