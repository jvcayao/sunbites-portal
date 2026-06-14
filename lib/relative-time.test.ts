import { relativeTime } from "./relative-time";

function isoSecondsAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString();
}

describe("relativeTime", () => {
  it('returns "just now" for timestamps under 60 seconds ago', () => {
    expect(relativeTime(isoSecondsAgo(30))).toBe("just now");
    expect(relativeTime(isoSecondsAgo(59))).toBe("just now");
  });

  it('returns "{N}m" for timestamps 1–59 minutes ago', () => {
    expect(relativeTime(isoSecondsAgo(60))).toBe("1m");
    expect(relativeTime(isoSecondsAgo(5 * 60))).toBe("5m");
    expect(relativeTime(isoSecondsAgo(59 * 60))).toBe("59m");
  });

  it('returns "{N}h" for timestamps 1–23 hours ago', () => {
    expect(relativeTime(isoSecondsAgo(3600))).toBe("1h");
    expect(relativeTime(isoSecondsAgo(23 * 3600))).toBe("23h");
  });

  it('returns "{N}d" for timestamps 1–6 days ago', () => {
    expect(relativeTime(isoSecondsAgo(86400))).toBe("1d");
    expect(relativeTime(isoSecondsAgo(6 * 86400))).toBe("6d");
  });

  it("returns a formatted date for timestamps 7+ days ago", () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000);
    const result = relativeTime(sevenDaysAgo.toISOString());
    expect(result).toMatch(/^[A-Z][a-z]+ \d+$/);
  });
});
