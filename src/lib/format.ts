import { format, isValid, parseISO } from "date-fns";

/**
 * Format a date string or Date object using the given pattern.
 * Returns empty string for null/undefined/invalid dates.
 */
export function formatDate(date: string | Date | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, pattern);
}

/**
 * Format a date with time (dd/MM/yyyy HH:mm).
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

/**
 * Format a number as Vietnamese currency (VND).
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format a Vietnamese phone number (0xxx xxx xxx).
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
