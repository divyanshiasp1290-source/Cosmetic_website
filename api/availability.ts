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
 * Returns today's and tomorrow's date strings (YYYY-MM-DD) in the clinic's timezone (America/Vancouver).
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

/**
 * Converts a date string (YYYY-MM-DD) and optional time (HH:mm) in clinic timezone
 * (America/Vancouver) to epoch milliseconds in UTC.
 */
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
 * Validates appointment booking date.
 * Rule: TODAY cannot be booked; TOMORROW and later can be booked.
 */
export function isBookingDateAllowed(dateStr: string, timeZone = CLINIC_TIMEZONE): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const { tomorrowStr } = getClinicDates(timeZone);
  return dateStr >= tomorrowStr;
}


type JsonResponse = Record<string, unknown>;

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
 * Queries Google Calendar FreeBusy API to find busy intervals on a given date in America/Vancouver.
 * If the OAuth token lacks freebusy scope but has calendar.events scope, gracefully falls back
 * to events.list so appointments are correctly reflected without exposing sensitive details.
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

  // Clinic operating window in America/Vancouver:
  // Query from 00:00:00 of the requested date to 00:00:00 of the following day in Vancouver.
  const startOfDayMs = getClinicDateTimeMs(date, "00:00", CLINIC_TIMEZONE);
  const [y, m, d] = date.split("-").map(Number);
  const nextDayDate = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  const nextDayStr = nextDayDate.toISOString().split("T")[0];
  const endOfDayMs = getClinicDateTimeMs(nextDayStr, "00:00", CLINIC_TIMEZONE);

  const timeMin = new Date(startOfDayMs).toISOString();
  const timeMax = new Date(endOfDayMs).toISOString();

  let busyIntervals: Array<{ startMs: number; endMs: number }> = [];

  // Attempt 1: Google Calendar FreeBusy API
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
    const freeBusyMsg =
      freeBusyErr instanceof Error ? freeBusyErr.message : String(freeBusyErr);
    console.warn(
      "[availability] FreeBusy query failed, attempting events.list fallback:",
      freeBusyMsg,
    );

    // Attempt 2: Fallback to events.list
    // (Used when OAuth token has calendar.events scope instead of full calendar or freebusy scope)
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
      console.error("[availability] Both FreeBusy and events.list failed:", eventsMsg);
      return {
        busyIntervals: [],
        calendarOk: false,
        error: eventsMsg,
      };
    }
  }
}

/**
 * Checks if a specific appointment slot (date + time) is available.
 * Returns true if available, false if occupied or outside clinic hours.
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
        reason: `The ${time} time slot is already booked on ${date}.`,
      };
    }
  }

  return { available: true };
}

/**
 * HTTP Handler for GET /api/availability?date=YYYY-MM-DD
 */
export default async function handler(
  req: Request | { method?: string; url?: string; headers?: Record<string, string> },
  res?: any,
): Promise<Response> {
  const rawUrl = "url" in req && req.url ? req.url : "/";
  const url = new URL(rawUrl, "http://localhost");
  const date = url.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json(
      400,
      {
        success: false,
        error: "Valid date query parameter (YYYY-MM-DD) is required.",
      },
      res,
    );
  }

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

  const { busyIntervals, calendarOk, error: calendarError } = await getCalendarBusyIntervals(date);

  const slots = CLINIC_TIME_SLOTS.map((slot) => {
    const slotStartMs = getClinicDateTimeMs(date, slot, CLINIC_TIMEZONE);
    const slotEndMs = slotStartMs + 60 * 60 * 1000;

    let available = true;
    if (calendarOk) {
      for (const busy of busyIntervals) {
        if (slotStartMs < busy.endMs && slotEndMs > busy.startMs) {
          available = false;
          break;
        }
      }
    }

    return {
      time: slot,
      label: formatTimeSlotLabel(slot),
      available,
    };
  });

  return json(
    200,
    {
      success: true,
      date,
      slots,
      calendarConnected: calendarOk,
      ...(calendarError ? { calendarWarning: "Google Calendar sync is currently degraded." } : {}),
    },
    res,
  );
}
