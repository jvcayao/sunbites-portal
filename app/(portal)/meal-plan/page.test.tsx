import { http, HttpResponse } from "msw";

import { render, screen, waitFor } from "@/__tests__/test-utils";

import { server } from "@/__tests__/mocks/server";

import MealPlanPage from "./page";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Router mock
// ---------------------------------------------------------------------------

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/meal-plan",
}));

// ---------------------------------------------------------------------------
// Auth store mock
// ---------------------------------------------------------------------------

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
  updateParent: jest.fn(),
};

jest.mock("@/lib/store/auth", () => ({
  useAuthStore: Object.assign(
    (sel: (s: typeof mockAuthState) => unknown) => sel(mockAuthState),
    { getState: () => mockAuthState },
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockReplace.mockClear();
  mockAuthState.parent.has_subscription_student = false;
});

describe("MealPlanPage — route guard", () => {
  it("calls router.replace('/dashboard') and renders nothing when has_subscription_student is false", async () => {
    const { container } = render(<MealPlanPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("does not call router.replace when has_subscription_student is true", () => {
    mockAuthState.parent.has_subscription_student = true;

    render(<MealPlanPage />);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("renders meal plan content when has_subscription_student is true", async () => {
    mockAuthState.parent.has_subscription_student = true;

    server.use(
      http.get(`${API}/portal/meal-planner`, () =>
        HttpResponse.json({
          visible_to_parents: true,
          days: [
            {
              day: 1,
              day_label: "Monday",
              ulam: "Adobo",
              vegetables: "Kangkong",
              fruit: "Banana",
              soup: "Sinigang",
              snacks: "Banana Bread",
            },
          ],
        }),
      ),
    );

    render(<MealPlanPage />);

    expect(
      screen.getByRole("heading", { name: "Meal Plan" }),
    ).toBeInTheDocument();
  });
});
