/**
 * Server-side validation rules for Dermacare Clinic appointments and customer details.
 */

export const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE || "America/Vancouver";

/**
 * Validates whether a phone number conforms to standard North American Numbering Plan (NANP)
 * 10-digit format (or 11 digits starting with country code 1), or international E.164.
 */
export function isValidPhoneNumber(phone: unknown): boolean {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  // Standard 10-digit North American number:
  // Area code and central office exchange cannot start with 0 or 1
  if (digits.length === 10) {
    return digits[0] >= "2" && digits[3] >= "2";
  }

  // 11-digit North American number with leading country code 1
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits[1] >= "2" && digits[4] >= "2";
  }

  // International format with leading '+' and 10 to 15 digits
  if (trimmed.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return true;
  }

  return false;
}

/**
 * Normalizes a phone number into readable format: (XXX) XXX-XXXX or +1 (XXX) XXX-XXXX
 */
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
 * Greater Vancouver Forward Sortation Areas (FSAs) within approximately 20 km
 * of Dermacare Clinic (920 W King Edward Ave, Vancouver, BC, V5Z 2E2).
 */
export const LOCAL_SERVICE_FSAS = new Set([
  // Vancouver
  "V5K",
  "V5L",
  "V5M",
  "V5N",
  "V5P",
  "V5R",
  "V5S",
  "V5T",
  "V5U",
  "V5V",
  "V5W",
  "V5X",
  "V5Y",
  "V5Z",
  "V6A",
  "V6B",
  "V6C",
  "V6E",
  "V6G",
  "V6H",
  "V6J",
  "V6K",
  "V6L",
  "V6M",
  "V6N",
  "V6P",
  "V6R",
  "V6S",
  "V6T",
  "V6Z",
  // Burnaby
  "V5A",
  "V5B",
  "V5C",
  "V5E",
  "V5G",
  "V5H",
  "V5J",
  // Richmond
  "V6V",
  "V6W",
  "V6X",
  "V6Y",
  "V7A",
  "V7B",
  "V7C",
  "V7E",
  // North Vancouver & West Vancouver
  "V7G",
  "V7H",
  "V7J",
  "V7K",
  "V7L",
  "V7M",
  "V7N",
  "V7P",
  "V7R",
  "V7S",
  "V7T",
  "V7V",
  // New Westminster
  "V3L",
  "V3M",
  // Delta / Surrey (North / Northwest within ~20 km)
  "V4C",
  "V4E",
  "V4G",
  "V4K",
  "V3R",
  "V3T",
  "V3V",
  "V3W",
  // Port Moody / Coquitlam (within ~20 km)
  "V3H",
  "V3J",
  "V3K",
]);

/**
 * Normalizes a Canadian Postal Code to 'A1A 1A1' format.
 */
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

/**
 * Validates if the input matches Canadian postal code format (A1A 1A1 or A1A1A1).
 */
export function isValidCanadianPostalCode(postal: unknown): boolean {
  if (!postal || typeof postal !== "string") return false;
  const clean = postal
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const canadianPostalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/;
  return canadianPostalRegex.test(clean);
}

/**
 * Checks if the postal code is within approximately 20 km of Dermacare Clinic in Vancouver.
 */
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
