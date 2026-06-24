"use client";

import { render, screen } from "@/__tests__/test-utils";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/mocks/server";
import StudentsPage from "./page";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const mockUpdateParent = jest.fn();
const mockAuthState = {
  token: "test-token",
  parent: {
    id: 1,
    first_name: "Maria",
    last_name: "Santos",
    email: "p@test.test",
    phone: null,
    address: null,
    profile_photo_url: null,
    created_at: "2026-01-01T00:00:00.000000Z",
    has_subscription_student: false,
  },
  login: jest.fn(),
  logout: jest.fn(),
  updateParent: mockUpdateParent,
};

jest.mock("@/lib/store/auth", () => ({
  useAuthStore: Object.assign(
    (sel: (s: typeof mockAuthState) => unknown) => sel(mockAuthState),
    { getState: () => mockAuthState },
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/students",
}));

const studentFixture = {
  id: 1,
  student_number: "2024-001",
  full_name: "Juan Dela Cruz",
  grade_level: "Grade 3",
  branch_name: "Main Branch",
  wallet_balance: 500,
  wallet_alert_threshold: 0,
  enrollment_status: "enrolled",
  student_type: "subscription",
  subscription_monthly_status: null,
};

beforeEach(() => {
  mockUpdateParent.mockClear();
  server.use(
    http.get(`${API}/portal/students`, () =>
      HttpResponse.json({ data: [studentFixture] }),
    ),
  );
});

describe("StudentsPage", () => {
  it("renders students returned from the API", async () => {
    render(<StudentsPage />);
    expect(await screen.findByText("Juan Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Grade 3 · Main Branch")).toBeInTheDocument();
  });

  it("calls updateParent when subscription flag does not match live data", async () => {
    render(<StudentsPage />);
    await screen.findByText("Juan Dela Cruz");
    expect(mockUpdateParent).toHaveBeenCalledWith(
      expect.objectContaining({ has_subscription_student: true }),
    );
  });

  it("shows empty state when no students are linked", async () => {
    server.use(
      http.get(`${API}/portal/students`, () => HttpResponse.json({ data: [] })),
    );
    render(<StudentsPage />);
    expect(
      await screen.findByText("No students linked to your account."),
    ).toBeInTheDocument();
  });
});
