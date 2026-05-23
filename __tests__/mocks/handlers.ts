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
      },
    })
  ),

  http.post(`${API}/portal/auth/logout`, () =>
    new HttpResponse(null, { status: 204 })
  ),
];
