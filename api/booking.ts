import nodemailer from "nodemailer";
import { createDAVClient } from "tsdav";

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

type JsonResponse =
  | { success: true }
  | { success: false; error: string };

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

const processedBookingSessions = ((globalThis as GlobalWithProcessedSessions).__processedBookingSessions ??= new Map<string, boolean>());

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
    typeof smtpSecureRaw !== "undefined"
      ? smtpSecureRaw.toLowerCase() === "true"
      : port === 465;

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


/* ---------------- CALDAV ---------------- */

async function createCalendarEvent(data: any) {
  const client = await createDAVClient({
    serverUrl: getEnv("OX_URL"),
    credentials: {
      username: getEnv("OX_USERNAME"),
      password: getEnv("OX_PASSWORD"),
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  const calendars = await client.fetchCalendars();

  const calendar = calendars[0]; // default calendar

  const start = new Date(`${data.date}T${data.time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${data.service}
DESCRIPTION:Name: ${data.fullName}\\nPhone: ${data.phone}\\nEmail: ${data.email}\\nNotes: ${data.notes}
DTSTART:${start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
END:VEVENT
END:VCALENDAR
  `.trim();

  // Some tsdav versions accept only (calendar, data), others accept an options object.
  // To preserve runtime behavior without changing booking flow, pass the options shape that works.
  // Keep compatibility across tsdav typings by casting to the callable signature.
  await (client as any).createCalendarObject(calendar, {
    data: ics,
  });
}

/* ---------------- HANDLER ---------------- */

export default async function handler(req: any, res: any): Promise<Response> {
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

  if (!isNonEmptyString(fullName))
    return json(400, { success: false, error: "fullName required" });

  if (!isNonEmptyString(email))
    return json(400, { success: false, error: "email required" });

  if (!isNonEmptyString(phone))
    return json(400, { success: false, error: "phone required" });

  if (!isNonEmptyString(service))
    return json(400, { success: false, error: "service required" });

  if (!isNonEmptyString(date))
    return json(400, { success: false, error: "date required" });

  if (!isNonEmptyString(time))
    return json(400, { success: false, error: "time required" });

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
      process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

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
        "Booking warning: SMTP env vars missing (SKIPPING EMAIL). Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS."
      );
    }

    /* ---------------- 3. CALENDAR EVENT ---------------- */
    if (!process.env.OX_URL || !process.env.OX_USERNAME || !process.env.OX_PASSWORD) {
      return json(500, {
        success: false,
        error: "Server misconfigured: missing OX_URL/OX_USERNAME/OX_PASSWORD",
      });
    }

    await createCalendarEvent({
      fullName,
      email,
      phone,
      service,
      date,
      time,
      notes: safeNotes,
    });

    return json(200, { success: true });
  } catch (err: any) {
    console.error("Booking error:", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : JSON.stringify(err);
    return json(500, {
      success: false,
      error: message || "Server error while processing booking",
    });
  }
}