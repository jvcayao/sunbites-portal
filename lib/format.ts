/**
 * Format a number as Philippine Peso currency.
 * Example: formatPHP(1234.5) → "PHP 1,234.50"
 */
export function formatPHP(amount: number): string {
  return `PHP ${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format an ISO date string to a readable date.
 * Example: formatDate("2025-05-24T10:00:00Z") → "May 24, 2025"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format an ISO date string to a readable date with time.
 * Example: "May 24, 2025, 10:00 AM"
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a YYYY-MM-DD date string as a human-readable birthday.
 * Uses local date construction to avoid UTC midnight timezone offset issues.
 * Example: formatBirthday("2011-05-15") → "May 15, 2011"
 */
export function formatBirthday(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
