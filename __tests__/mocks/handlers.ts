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
];
