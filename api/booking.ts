import nodemailer from "nodemailer";
import { google } from "googleapis";

export const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE || "America/Vancouver";

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

export function isBookingDateAllowed(dateStr: string, timeZone = CLINIC_TIMEZONE): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const { tomorrowStr } = getClinicDates(timeZone);
  return dateStr >= tomorrowStr;
}

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

type BookingRequestBody = {
  fullName: unknown;
  email: unknown;
  phone: unknown;
  postalCode?: unknown;
  service: unknown;
  date: unknown;
  time: unknown;
  notes?: unknown;
  paymentStatus?: unknown; // "pay_at_clinic" | "paid"
  stripeSessionId?: unknown;
};

type JsonResponse = { success: true } | { success: false; error: string };

function json(status: number, payload: JsonResponse, res?: any): Response {
  if (res && typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(payload);
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

type GlobalWithProcessedSessions = typeof globalThis & {
  __processedBookingSessions?: Map<string, boolean>;
};

const processedBookingSessions = ((
  globalThis as GlobalWithProcessedSessions
).__processedBookingSessions ??= new Map<string, boolean>());

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
 * Checks busy intervals in Google Calendar to prevent double booking.
 */
export async function getCalendarBusyIntervals(date: string): Promise<{
  busyIntervals: Array<{ startMs: number; endMs: number }>;
  calendarOk: boolean;
  error?: string;
}> {
  const gcal = getGoogleCalendarClient();
  if (!gcal) {
    return {
      busyIntervals: [],
      calendarOk: false,
      error: "Google Calendar environment variables are not fully configured.",
    };
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

    return { busyIntervals, calendarOk: true };
  } catch (freeBusyErr: unknown) {
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

      return { busyIntervals, calendarOk: true };
    } catch (eventsErr: unknown) {
      const eventsMsg = eventsErr instanceof Error ? eventsErr.message : String(eventsErr);
      return {
        busyIntervals: [],
        calendarOk: false,
        error: eventsMsg,
      };
    }
  }
}

/**
 * Checks if a specific appointment slot is already taken on Google Calendar.
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

  const { busyIntervals, calendarOk } = await getCalendarBusyIntervals(date);
  if (!calendarOk) {
    return { available: true };
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

/* ---------------- EMAIL ---------------- */

function createTransport() {
  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT"));
  const smtpSecureRaw = process.env.SMTP_SECURE;
  const secure =
    typeof smtpSecureRaw !== "undefined" ? smtpSecureRaw.toLowerCase() === "true" : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: getEnv("SMTP_USER"),
      pass: getEnv("SMTP_PASS"),
    },
  });
}

async function parseBody(req: any): Promise<BookingRequestBody | null> {
  if (req && typeof req.json === "function") {
    try {
      const b = await req.json();
      return typeof b === "object" && b !== null ? b : null;
    } catch {
      return null;
    }
  }
  if (req && req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    if (typeof req.body === "object") {
      return req.body;
    }
  }
  return null;
}

/* ---------------- HANDLER ---------------- */

export default async function handler(
  req: Request | { method?: string; body?: any; json?: () => Promise<unknown> },
  res?: any,
): Promise<Response> {
  const method = (req?.method ?? "POST").toUpperCase();
  if (method !== "POST") {
    return json(405, { success: false, error: "Method Not Allowed" }, res);
  }

  const body = await parseBody(req);

  if (!body) {
    return json(400, { success: false, error: "Invalid JSON body" }, res);
  }

  const { fullName, email, phone, postalCode, service, date, time, notes, paymentStatus, stripeSessionId } = body;

  if (!isNonEmptyString(fullName)) return json(400, { success: false, error: "fullName required" }, res);
  if (!isNonEmptyString(email)) return json(400, { success: false, error: "email required" }, res);
  if (!isNonEmptyString(phone)) return json(400, { success: false, error: "phone required" }, res);

  if (!isValidPhoneNumber(phone)) {
    return json(400, { success: false, error: "Valid 10-digit phone number required" }, res);
  }

  if (!isNonEmptyString(service)) return json(400, { success: false, error: "service required" }, res);
  if (!isNonEmptyString(date)) return json(400, { success: false, error: "date required" }, res);
  if (!isNonEmptyString(time)) return json(400, { success: false, error: "time required" }, res);

  if (!isBookingDateAllowed(date)) {
    return json(
      400,
      {
        success: false,
        error: "Appointments cannot be booked for today. Please select tomorrow or a later date.",
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

  const normalizedSessionId = isNonEmptyString(stripeSessionId) ? stripeSessionId : null;
  const isPayAtClinic = paymentStatus === "pay_at_clinic" || (!normalizedSessionId && paymentStatus !== "paid");
  const formattedPhone = formatPhoneNumber(phone);
  const formattedPostal = isNonEmptyString(postalCode) ? formatPostalCode(postalCode) : "-";
  const safeNotes = isNonEmptyString(notes) ? notes : "-";

  // Idempotency: if this paid session was already handled, return success
  if (normalizedSessionId && processedBookingSessions.has(normalizedSessionId)) {
    return json(200, { success: true }, res);
  }

  // DOUBLE-BOOKING PROTECTION: Check Google Calendar before confirming!
  const slotAvailability = await isSlotAvailable(date, time);
  if (!slotAvailability.available) {
    return json(
      400,
      {
        success: false,
        error:
          slotAvailability.reason ||
          `The ${formatTimeSlotLabel(time)} slot on ${date} is already booked. Please choose another time slot.`,
      },
      res,
    );
  }

  if (normalizedSessionId) {
    processedBookingSessions.set(normalizedSessionId, true);
  }

  const paymentLabel = isPayAtClinic
    ? "Pay at Clinic ($25 consultation fee to be collected at appointment)"
    : `Paid $25 Online Deposit (Stripe Session: ${normalizedSessionId ?? "Confirmed"})`;

  try {
    const allowEmail =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    /* ---------------- 1-2. EMAILS (optional) ---------------- */
    if (allowEmail) {
      try {
        const transporter = createTransport();

        await transporter.sendMail({
          from: getEnv("SMTP_USER"),
          to: "info@dermacareclinic.ca",
          subject: `New Booking - ${service} [${isPayAtClinic ? "Pay at Clinic" : "Paid Online"}]`,
          text: `
New Consultation Booking:

Name: ${fullName}
Email: ${email}
Phone: ${formattedPhone}
Postal Code: ${formattedPostal}
Service: ${service}
Date: ${date}
Time: ${formatTimeSlotLabel(time)}
Payment Option: ${paymentLabel}
Notes: ${safeNotes}
          `,
        });

        await transporter.sendMail({
          from: getEnv("SMTP_USER"),
          to: email,
          subject: "Booking Confirmed - Dermacare Clinic",
          text: `
Dear ${fullName},

Thank you for booking your consultation with Dermacare Clinic.

Service: ${service}
Date: ${date}
Time: ${formatTimeSlotLabel(time)}
Payment: ${isPayAtClinic ? "Pay at Clinic ($25 consultation fee due upon arrival)" : "Paid $25 Online"}

We look forward to welcoming you to our clinic.
          `,
        });
      } catch (emailErr) {
        console.error("Booking email warning:", emailErr);
      }
    }

    /* ---------------- GOOGLE CALENDAR ---------------- */
    const gcal = getGoogleCalendarClient();
    const googleTimezone = process.env.GOOGLE_TIMEZONE || CLINIC_TIMEZONE;

    if (gcal) {
      try {
        const startDateTime = `${date}T${time}:00`;
        const [year, month, day] = date.split("-").map((x) => Number(x));
        const [hour, minute] = time.split(":").map((x) => Number(x));

        const start = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const pad = (n: number) => String(n).padStart(2, "0");
        const endDateTime = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}T${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}:00`;

        const event = {
          summary: `Dermacare Consultation - ${service} [${isPayAtClinic ? "Pay at Clinic" : "Paid $25"}]`,
          description: `Booking details:\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${formattedPhone}\nPostal Code: ${formattedPostal}\nService: ${service}\nDate: ${date}\nTime: ${formatTimeSlotLabel(time)}\nPayment Status: ${paymentLabel}\nNotes: ${safeNotes}`,
          start: {
            dateTime: startDateTime,
            timeZone: googleTimezone,
          },
          end: {
            dateTime: endDateTime,
            timeZone: googleTimezone,
          },
        };

        await gcal.calendar.events.insert({
          calendarId: gcal.googleCalendarId,
          requestBody: event,
        });
      } catch (calErr) {
        console.error("Booking calendar insert error:", calErr);
      }
    }

    return json(200, { success: true }, res);
  } catch (err: unknown) {
    console.error("Booking error:", err);
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
    return json(
      500,
      {
        success: false,
        error: message || "Server error while processing booking",
      },
      res,
    );
  }
}
