import nodemailer from "nodemailer";
import { google } from "googleapis";

type BookingRequestBody = {
  fullName: unknown;
  email: unknown;
  phone: unknown;

  service: unknown;
  date: unknown;
  time: unknown;
  notes: unknown;
  stripeSessionId?: unknown;
};

type JsonResponse = { success: true } | { success: false; error: string };

function json(status: number, payload: JsonResponse): Response {
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

function requireGoogleEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

/* ---------------- EMAIL ---------------- */

function createTransport() {
  // SMTP env vars validated by caller (allowEmail)

  const host = getEnv("SMTP_HOST");

  const port = Number(getEnv("SMTP_PORT"));
  // Many SMTP providers use:
  // - secure/implicit TLS on port 465
  // - STARTTLS on ports like 587 (secure=false)
  // Allow explicit override via SMTP_SECURE.
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

/* ---------------- HANDLER ---------------- */

export default async function handler(
  req: { method?: string; json: () => Promise<unknown> },
  res: unknown,
): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { success: false, error: "Method Not Allowed" });
  }

  let body: BookingRequestBody;

  try {
    body = await req.json();
  } catch {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  if (!body) {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  const { fullName, email, phone, service, date, time, notes, stripeSessionId } = body;

  if (!isNonEmptyString(fullName)) return json(400, { success: false, error: "fullName required" });

  if (!isNonEmptyString(email)) return json(400, { success: false, error: "email required" });

  if (!isNonEmptyString(phone)) return json(400, { success: false, error: "phone required" });

  if (!isNonEmptyString(service)) return json(400, { success: false, error: "service required" });

  if (!isNonEmptyString(date)) return json(400, { success: false, error: "date required" });

  if (!isNonEmptyString(time)) return json(400, { success: false, error: "time required" });

  const safeNotes = isNonEmptyString(notes) ? notes : "-";
  const normalizedSessionId = isNonEmptyString(stripeSessionId) ? stripeSessionId : null;

  if (normalizedSessionId && processedBookingSessions.has(normalizedSessionId)) {
    return json(200, { success: true });
  }

  if (normalizedSessionId) {
    processedBookingSessions.set(normalizedSessionId, true);
  }

  try {
    const allowEmail =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    /* ---------------- 1-2. EMAILS (optional) ---------------- */
    if (allowEmail) {
      const transporter = createTransport();

      await transporter.sendMail({
        from: getEnv("SMTP_USER"),
        to: "info@dermacareclinic.ca",
        subject: `New Booking - ${service}`,
        text: `
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Service: ${service}
Date: ${date}
Time: ${time}
Notes: ${safeNotes}
        `,
      });

      await transporter.sendMail({
        from: getEnv("SMTP_USER"),
        to: email,
        subject: "Booking Confirmed - Dermacare Clinic",
        text: `
Thank you for your booking.

Service: ${service}
Date: ${date}
Time: ${time}

We will contact you soon.
        `,
      });
    } else {
      console.warn(
        "Booking warning: SMTP env vars missing (SKIPPING EMAIL). Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
      );
    }

    /* ---------------- GOOGLE CALENDAR ---------------- */
    const googleClientId = requireGoogleEnv("GOOGLE_CLIENT_ID");
    const googleClientSecret = requireGoogleEnv("GOOGLE_CLIENT_SECRET");
    const googleRefreshToken = requireGoogleEnv("GOOGLE_REFRESH_TOKEN");
    const googleCalendarId = requireGoogleEnv("GOOGLE_CALENDAR_ID");
    const googleTimezone = process.env.GOOGLE_TIMEZONE || "America/Toronto";

    const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret, undefined);
    oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startDateTime = `${date}T${time}:00`;
    const endDateTime = (() => {
      const [year, month, day] = date.split("-").map((x) => Number(x));
      const [hour, minute] = time.split(":").map((x) => Number(x));

      const start = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const pad = (n: number) => String(n).padStart(2, "0");
      return `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}T${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}:00`;
    })();


    const event = {
      summary: `Dermacare Consultation - ${service}`,

      description: `Booking details:\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nDate: ${date}\nTime: ${time}\nNotes: ${safeNotes}`,
      start: {
        dateTime: startDateTime,
        timeZone: googleTimezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: googleTimezone,
      },
    };

    await calendar.events.insert({
      calendarId: googleCalendarId,
      requestBody: event,
    });

    return json(200, { success: true });
  } catch (err: unknown) {
    console.error("Booking error:", err);
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
    return json(500, {
      success: false,
      error: message || "Server error while processing booking",
    });
  }
}
