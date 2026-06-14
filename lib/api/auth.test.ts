import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/mocks/server";
import { authApi } from "./auth";

const API = process.env.NEXT_PUBLIC_API_URL;

describe("authApi (portal)", () => {
  it("logout() calls POST /portal/auth/logout and returns void", async () => {
    server.use(
      http.post(
        `${API}/portal/auth/logout`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    await expect(authApi.logout()).resolves.toBeUndefined();
  });
});
