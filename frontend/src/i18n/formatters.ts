import {
  getLocaleDefinition,
  type InterfaceLocale,
  type OutputLocale,
} from "./locale-registry";

type FormattingLocale = InterfaceLocale | OutputLocale;
type DateInput = Date | string;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function intlLocale(locale: FormattingLocale): string {
  return getLocaleDefinition(locale).intlLocale;
}

function validCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function requireDateOnly(value: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new RangeError("A valid ISO date is required.");
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!validCalendarDate(year, month, day)) {
    throw new RangeError("A valid ISO date is required.");
  }

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function requireDateTime(value: DateInput): Date {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) {
      throw new RangeError("A valid date and time is required.");
    }
    return new Date(value.getTime());
  }

  const match = DATE_TIME_PATTERN.exec(value);
  if (!match) {
    throw new RangeError("A complete ISO date and time is required.");
  }

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    offsetText,
  ] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  if (
    !validCalendarDate(year, month, day) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new RangeError("A valid date and time is required.");
  }

  if (offsetText !== "Z") {
    const offsetHour = Number(offsetText.slice(1, 3));
    const offsetMinute = Number(offsetText.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) {
      throw new RangeError("A valid date and time offset is required.");
    }
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError("A valid date and time is required.");
  }
  return date;
}

function requireFinite(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("A finite numeric value is required.");
  }
  return value;
}

export function formatDateTime(
  value: DateInput,
  locale: FormattingLocale,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(requireDateTime(value));
}

export function formatDateOnly(
  value: string,
  locale: FormattingLocale,
): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(requireDateOnly(value));
}

export function formatNumber(
  value: number,
  locale: FormattingLocale,
): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(requireFinite(value));
}

export function formatCelsiusTemperature(
  value: number,
  locale: FormattingLocale,
): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "unit",
    unit: "celsius",
    unitDisplay: "short",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(requireFinite(value));
}

export function formatDistance(
  distanceM: number,
  locale: FormattingLocale,
): string {
  requireFinite(distanceM);
  if (distanceM < 0) {
    throw new RangeError("Distance must not be negative.");
  }

  const useKilometres = distanceM >= 1000;
  const value = useKilometres ? distanceM / 1000 : Math.round(distanceM);
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "unit",
    unit: useKilometres ? "kilometer" : "meter",
    unitDisplay: "short",
    minimumFractionDigits: useKilometres ? 1 : 0,
    maximumFractionDigits: useKilometres ? 1 : 0,
  }).format(value);
}
