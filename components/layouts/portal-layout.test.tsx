import { render, screen } from "@/__tests__/test-utils";

import { PortalLayout } from "./portal-layout";

// Prevent NotificationBell from making real API calls in layout tests.
jest.mock("@/components/notification-bell", () => ({
  NotificationBell: () => null,
}));

// Prevent AppLogo from requiring /icon.png in jsdom.
jest.mock("@/components/app-logo", () => ({
  AppLogo: () => <span>Logo</span>,
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

const mockAuthState = {
  token: "test-token",
  parent: {
    id: 1,
    first_name: "Maria",
    last_name: "Santos",
    email: "maria@example.com",
    phone: null,
    address: null,
    profile_photo_url: null,
    created_at: "2026-01-01T00:00:00.000000Z",
    has_subscription_student: false,
  },
  login: jest.fn(),
  logout: jest.fn(),
  updateParent: jest.fn(),
};

jest.mock("@/lib/store/auth", () => ({
  useAuthStore: Object.assign(
    (sel: (s: typeof mockAuthState) => unknown) => sel(mockAuthState),
    { getState: () => mockAuthState },
  ),
}));

describe("PortalLayout — Meal Plan nav visibility", () => {
  beforeEach(() => {
    mockAuthState.parent.has_subscription_student = false;
  });

  it("hides the Meal Plan link when has_subscription_student is false", () => {
    render(
      <PortalLayout>
        <div>page</div>
      </PortalLayout>,
    );

    expect(
      screen.queryByRole("link", { name: "Meal Plan" }),
    ).not.toBeInTheDocument();
  });

  it("shows the Meal Plan link when has_subscription_student is true", () => {
    mockAuthState.parent.has_subscription_student = true;

    render(
      <PortalLayout>
        <div>page</div>
      </PortalLayout>,
    );

    expect(screen.getByRole("link", { name: "Meal Plan" })).toBeInTheDocument();
  });

  it("always shows Dashboard, Students, and Feedback links regardless of subscription", () => {
    render(
      <PortalLayout>
        <div>page</div>
      </PortalLayout>,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Students" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Feedback" })).toBeInTheDocument();
  });
});
