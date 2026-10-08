import Stripe from "stripe";
import { google } from "googleapis";

export const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE || "America/Vancouver";

/**
 * Standard clinic operating hours: Monday – Sunday, 10:00 AM – 6:00 PM (1-hour slots).
 */
export const CLINIC_TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export type ClinicTimeSlot = (typeof CLINIC_TIME_SLOTS)[number];

export function isClinicTimeSlot(time: unknown): time is ClinicTimeSlot {
  return typeof time === "string" && (CLINIC_TIME_SLOTS as readonly string[]).includes(time);
}

export function formatTimeSlotLabel(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mStr || "00"} ${period}`;
}

/**
 * Returns today's and tomorrow's date strings (YYYY-MM-DD) in the clinic's timezone.
 */
export function getClinicDates(timeZone = CLINIC_TIMEZONE) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now);

  const [y, m, d] = todayStr.split("-").map(Number);
  const todayNoonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const tomorrowNoonUtc = new Date(todayNoonUtc.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = formatter.format(tomorrowNoonUtc);

  return { todayStr, tomorrowStr };
}

export function getClinicDateTimeMs(
  date: string,
  time = "00:00",
  timeZone = CLINIC_TIMEZONE,
): number {
  const noonUtc = new Date(`${date}T12:00:00Z`);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });
  const tzPart = fmt.formatToParts(noonUtc).find((p) => p.type === "timeZoneName")?.value;
  let offset = "-07:00";
  if (tzPart && tzPart.startsWith("GMT")) {
    offset = tzPart.replace("GMT", "");
  }
  const cleanTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${cleanTime}${offset}`).getTime();
}

/**
 * Validates appointment booking date: today cannot be booked; tomorrow and later allowed.
 */
export function isBookingDateAllowed(dateStr: string, timeZone = CLINIC_TIMEZONE): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const { tomorrowStr } = getClinicDates(timeZone);
  return dateStr >= tomorrowStr;
}

/**
 * Validates whether a phone number conforms to standard NANP 10/11 digits or E.164.
 */
export function isValidPhoneNumber(phone: unknown): boolean {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits[0] >= "2" && digits[3] >= "2";
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits[1] >= "2" && digits[4] >= "2";
  }

  if (trimmed.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return true;
  }

  return false;
}

export function formatPhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return trimmed;
}

export const LOCAL_SERVICE_FSAS = new Set([
  // Vancouver
  "V5K", "V5L", "V5M", "V5N", "V5P", "V5R", "V5S", "V5T", "V5U", "V5V", "V5W", "V5X", "V5Y", "V5Z",
  "V6A", "V6B", "V6C", "V6E", "V6G", "V6H", "V6J", "V6K", "V6L", "V6M", "V6N", "V6P", "V6R", "V6S", "V6T", "V6Z",
  // Burnaby
  "V5A", "V5B", "V5C", "V5E", "V5G", "V5H", "V5J",
  // Richmond
  "V6V", "V6W", "V6X", "V6Y", "V7A", "V7B", "V7C", "V7E",
  // North Vancouver & West Vancouver
  "V7G", "V7H", "V7J", "V7K", "V7L", "V7M", "V7N", "V7P", "V7R", "V7S", "V7T", "V7V",
  // New Westminster
  "V3L", "V3M",
  // Delta / Surrey
  "V4C", "V4E", "V4G", "V4K", "V3R", "V3T", "V3V", "V3W",
  // Port Moody / Coquitlam
  "V3H", "V3J", "V3K",
]);

export function formatPostalCode(postal: string): string {
  const clean = postal
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (clean.length === 6) {
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  return postal.trim().toUpperCase();
}

export function isValidCanadianPostalCode(postal: unknown): boolean {
  if (!postal || typeof postal !== "string") return false;
  const clean = postal
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const canadianPostalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/;
  return canadianPostalRegex.test(clean);
}

export function isWithinServiceArea(postal: unknown): { isEligible: boolean; message?: string } {
  if (!postal || typeof postal !== "string" || !isValidCanadianPostalCode(postal)) {
    return {
      isEligible: false,
      message: "Please enter a valid Canadian postal code (e.g. V5Z 2E2).",
    };
  }

  const clean = postal
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const fsa = clean.slice(0, 3);

  if (!LOCAL_SERVICE_FSAS.has(fsa)) {
    return {
      isEligible: false,
      message:
        "Dermacare Clinic serves clients within ~20 km of our Vancouver clinic (920 W King Edward Ave). Your postal code appears outside our local service area. Please contact us directly for inquiries.",
    };
  }

  return { isEligible: true };
}

function getGoogleCalendarClient() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const googleCalendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!googleClientId || !googleClientSecret || !googleRefreshToken || !googleCalendarId) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret, undefined);
  oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  return { calendar, googleCalendarId };
}

/**
 * Checks if a specific appointment slot is already taken on Google Calendar before initiating checkout.
 */
export async function isSlotAvailable(
  date: string,
  time: string,
): Promise<{ available: boolean; reason?: string }> {
  if (!isBookingDateAllowed(date)) {
    return {
      available: false,
      reason: "Appointments cannot be booked for today. Please select tomorrow or a later date.",
    };
  }

  if (!isClinicTimeSlot(time)) {
    return {
      available: false,
      reason: "Selected time is outside standard clinic hours.",
    };
  }

  const gcal = getGoogleCalendarClient();
  if (!gcal) {
    return { available: true };
  }

  const startOfDayMs = getClinicDateTimeMs(date, "00:00", CLINIC_TIMEZONE);
  const [y, m, d] = date.split("-").map(Number);
  const nextDayDate = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  const nextDayStr = nextDayDate.toISOString().split("T")[0];
  const endOfDayMs = getClinicDateTimeMs(nextDayStr, "00:00", CLINIC_TIMEZONE);

  const timeMin = new Date(startOfDayMs).toISOString();
  const timeMax = new Date(endOfDayMs).toISOString();

  let busyIntervals: Array<{ startMs: number; endMs: number }> = [];

  try {
    const res = await gcal.calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: CLINIC_TIMEZONE,
        items: [{ id: gcal.googleCalendarId }],
      },
    });

    const busyList = res.data.calendars?.[gcal.googleCalendarId]?.busy ?? [];
    busyIntervals = busyList
      .map((b) => {
        const startMs = b.start ? new Date(b.start).getTime() : NaN;
        const endMs = b.end ? new Date(b.end).getTime() : NaN;
        return { startMs, endMs };
      })
      .filter((b) => !isNaN(b.startMs) && !isNaN(b.endMs));
  } catch {
    try {
      const eventsRes = await gcal.calendar.events.list({
        calendarId: gcal.googleCalendarId,
        timeMin,
        timeMax,
        singleEvents: true,
      });

      const items = eventsRes.data.items ?? [];
      busyIntervals = items
        .filter((item) => item.status !== "cancelled" && item.transparency !== "transparent")
        .map((item) => {
          let startMs = NaN;
          let endMs = NaN;
          if (item.start?.dateTime && item.end?.dateTime) {
            startMs = new Date(item.start.dateTime).getTime();
            endMs = new Date(item.end.dateTime).getTime();
          } else if (item.start?.date && item.end?.date) {
            startMs = getClinicDateTimeMs(item.start.date, "00:00", CLINIC_TIMEZONE);
            endMs = getClinicDateTimeMs(item.end.date, "00:00", CLINIC_TIMEZONE);
          }
          return { startMs, endMs };
        })
        .filter((b) => !isNaN(b.startMs) && !isNaN(b.endMs));
    } catch {
      return { available: true };
    }
  }

  const slotStartMs = getClinicDateTimeMs(date, time, CLINIC_TIMEZONE);
  const slotEndMs = slotStartMs + 60 * 60 * 1000;

  for (const busy of busyIntervals) {
    if (slotStartMs < busy.endMs && slotEndMs > busy.startMs) {
      return {
        available: false,
        reason: `The ${formatTimeSlotLabel(time)} time slot is already booked on ${date}. Please choose another time slot.`,
      };
    }
  }

  return { available: true };
}

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
        (host.includes("localhost") ? "http" : "https");
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

async function parseBody(req: any): Promise<Record<string, unknown>> {
  if (req && typeof req.json === "function") {
    try {
      const parsed = await req.json();
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  if (req && req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (typeof req.body === "object") {
      return req.body;
    }
  }
  return {};
}

export default async function handler(
  req: Request | { method?: string; url?: string; headers?: any; body?: any; json?: () => Promise<unknown> },
  res?: any,
): Promise<Response> {
  const method = (req?.method ?? "POST").toUpperCase();

  const watchdogMs = Number(process.env.CHECKOUT_ENDPOINT_WATCHDOG_MS ?? 25000);

  try {
    return await withTimeout(
      (async () => {
        if (method !== "POST") {
          return json(405, { success: false, error: "Method Not Allowed" }, res);
        }

        const body = await parseBody(req);

        const fullName = String(body.fullName ?? "").trim();
        const email = String(body.email ?? "").trim();
        const rawPhone = String(body.phone ?? "").trim();
        const rawPostalCode = String(body.postalCode ?? "").trim();
        const service = String(body.service ?? "").trim();
        const date = String(body.date ?? "").trim();
        const time = String(body.time ?? "").trim();
        const notes = String(body.notes ?? "").trim();

        if (!fullName || !email || !rawPhone || !rawPostalCode || !service || !date || !time) {
          return json(
            400,
            {
              success: false,
              error: "All required booking fields, including postal code, must be provided.",
            },
            res,
          );
        }

        if (!isValidPhoneNumber(rawPhone)) {
          return json(
            400,
            {
              success: false,
              error: "Please enter a valid 10-digit phone number.",
            },
            res,
          );
        }

        const serviceAreaCheck = isWithinServiceArea(rawPostalCode);
        if (!serviceAreaCheck.isEligible) {
          return json(
            400,
            {
              success: false,
              error:
                serviceAreaCheck.message || "Postal code is outside our local service area (~20 km).",
            },
            res,
          );
        }

        if (!isBookingDateAllowed(date)) {
          return json(
            400,
            {
              success: false,
              error:
                "Appointments cannot be booked for today. Please select tomorrow or a later date.",
            },
            res,
          );
        }

        if (!isClinicTimeSlot(time)) {
          return json(
            400,
            {
              success: false,
              error: "Please select a valid appointment time during clinic operating hours.",
            },
            res,
          );
        }

        // DOUBLE BOOKING PROTECTION: verify time slot is still free before creating Checkout session
        const slotCheck = await isSlotAvailable(date, time);
        if (!slotCheck.available) {
          return json(
            400,
            {
              success: false,
              error:
                slotCheck.reason ||
                `The ${formatTimeSlotLabel(time)} slot is already booked on ${date}. Please select an available slot.`,
            },
            res,
          );
        }

        const phone = formatPhoneNumber(rawPhone);
        const postalCode = formatPostalCode(rawPostalCode);

        const metadata = {
          fullName,
          email,
          phone,
          postalCode,
          service,
          date,
          time,
          notes,
          paymentStatus: "paid",
        };

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
          return json(
            500,
            {
              success: false,
              error: "Server misconfigured: missing STRIPE_SECRET_KEY",
            },
            res,
          );
        }

        const stripe = new Stripe(stripeSecretKey);
        const baseUrl = getBaseUrl(req);

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
          success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/payment-cancel`,
          metadata,
        });

        const session = await withTimeout(
          createPromise,
          Number(process.env.CHECKOUT_STRIPE_CREATE_TIMEOUT_MS ?? 15000),
          "stripe.checkout.sessions.create",
        );

        if (!session?.url) {
          return json(500, { success: false, error: "Stripe session missing url" }, res);
        }

        return json(200, { success: true, url: session.url }, res);
      })(),
      watchdogMs,
      "create-checkout-session handler watchdog",
    );
  } catch (error) {
    return json(
      500,
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to create checkout session",
      },
      res,
    );
  }
}
