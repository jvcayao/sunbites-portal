import { http, HttpResponse } from "msw";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const handlers = [
  http.post(`${API}/portal/auth/login`, () =>
    HttpResponse.json({
      token: "test-sanctum-token",
      parent: {
        id: 1,
        first_name: "Maria",
        last_name: "Santos",
        email: "parent@sunbites.test",
        phone: null,
        address: null,
        profile_photo_url: null,
        created_at: "2026-01-01T00:00:00.000000Z",
      },
    }),
  ),

  http.post(
    `${API}/portal/auth/logout`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.get(`${API}/portal/students/:id/payment-history`, () =>
    HttpResponse.json({
      data: [
        { id: 1, school_month: "february", year: 2026, amount: 2500, status: "paid",   paid_at: "2026-02-06T10:00:00Z" },
        { id: 2, school_month: "march",    year: 2026, amount: 2500, status: "paid",   paid_at: "2026-03-04T10:00:00Z" },
        { id: 3, school_month: "april",    year: 2026, amount: 2500, status: "unpaid", paid_at: null },
        { id: 4, school_month: "may",      year: 2026, amount: 2500, status: "paid",   paid_at: "2026-05-03T10:00:00Z" },
        { id: 5, school_month: "june",     year: 2026, amount: 2500, status: "paid",   paid_at: "2026-06-05T10:00:00Z" },
      ],
    }),
  ),
];
