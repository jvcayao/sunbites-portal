function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type DateRangeFilter = "today" | "this-week" | "this-month";

export function getDateRange(filter: DateRangeFilter): { from: string; to: string } {
  const today = new Date();

  if (filter === "today") {
    const d = toISODate(today);
    return { from: d, to: d };
  }

  if (filter === "this-week") {
    const monday = new Date(today);
    const day = monday.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: toISODate(monday), to: toISODate(sunday) };
  }

  // this-month
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: toISODate(firstDay), to: toISODate(lastDay) };
}
