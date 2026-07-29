import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";
import { SpendingInsights } from "./spending-insights";
import type { StudentSummary } from "@/types/portal";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
  Cell: () => null,
}));

const students: StudentSummary[] = [
  {
    id: 1,
    student_number: "2026-001",
    full_name: "Juan Cayao",
    first_name: "Juan",
    last_name: "Cayao",
    grade_level: "Grade 3",
    section: null,
    birthday: null,
    notes: null,
    qr_code: null,
    photo_url: null,
    branch_name: "Main",
    allergies: null,
    wallet_balance: 500,
    credit_balance: 0,
    wallet_alert_threshold: 100,
    enrollment_status: "enrolled",
    student_type: "subscription",
    subscription_monthly_status: null,
  },
  {
    id: 2,
    student_number: "2026-002",
    full_name: "Maria Cayao",
    first_name: "Maria",
    last_name: "Cayao",
    grade_level: "Grade 1",
    section: null,
    birthday: null,
    notes: null,
    qr_code: null,
    photo_url: null,
    branch_name: "Main",
    allergies: null,
    wallet_balance: 300,
    credit_balance: 0,
    wallet_alert_threshold: 100,
    enrollment_status: "enrolled",
    student_type: "non_subscription",
    subscription_monthly_status: null,
  },
];

describe("SpendingInsights", () => {
  it("renders a switcher button per student", async () => {
    render(<SpendingInsights students={students} />);
    expect(screen.getByRole("button", { name: /juan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /maria/i })).toBeInTheDocument();
  });

  it("shows stat cells after data loads", async () => {
    render(<SpendingInsights students={students} />);
    expect(await screen.findByText(/1,250/)).toBeInTheDocument(); // this_month_total
    expect(await screen.findByText(/5,950/)).toBeInTheDocument(); // ytd_total
    const spaghettiElements = await screen.findAllByText("Spaghetti");
    expect(spaghettiElements.length).toBeGreaterThan(0); // top item
  });

  it("shows subscription payment section for subscription students", async () => {
    render(<SpendingInsights students={students} />);
    // Payment history section heading only appears for subscription students
    expect(
      await screen.findByText(/subscription payments/i),
    ).toBeInTheDocument();
  });

  it("hides subscription section when switching to a non-subscription student", async () => {
    render(<SpendingInsights students={students} />);
    await screen.findAllByText("Spaghetti"); // wait for initial data

    await userEvent.click(screen.getByRole("button", { name: /maria/i }));
    // After switching, subscription section should not appear
    expect(
      screen.queryByText(/subscription payments/i),
    ).not.toBeInTheDocument();
  });

  it("shows error message when API fails", async () => {
    server.use(
      http.get("*/portal/students/:id/spending-summary", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );
    render(<SpendingInsights students={students} />);
    expect(
      await screen.findByText(/failed to load spending data/i),
    ).toBeInTheDocument();
  });

  it("returns null when students array is empty", () => {
    const { container } = render(<SpendingInsights students={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
