import { render, screen } from "@/__tests__/test-utils";
import { ProfileTab } from "./profile-tab";
import type { StudentSummary } from "@/types/portal";

const baseStudent: StudentSummary = {
  id: 1,
  student_number: "2024-001",
  full_name: "Juan Dela Cruz",
  first_name: "Juan",
  last_name: "Dela Cruz",
  grade_level: "Grade 9",
  section: "Sampaguita",
  birthday: "2011-05-15",
  notes: "Bring umbrella",
  qr_code: "SB-abc123",
  photo_url: null,
  branch_name: "Antipolo",
  allergies: null,
  wallet_balance: 500,
  credit_balance: 0,
  wallet_alert_threshold: 0,
  enrollment_status: "enrolled",
  student_type: "non_subscription",
  subscription_monthly_status: null,
};

describe("ProfileTab", () => {
  it("renders all personal information fields", () => {
    render(<ProfileTab student={baseStudent} />);

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Grade 9")).toBeInTheDocument();
    expect(screen.getByText("Sampaguita")).toBeInTheDocument();
    expect(screen.getByText("2024-001")).toBeInTheDocument();
    expect(screen.getByText("Non-Subscription")).toBeInTheDocument();
    expect(screen.getByText("Bring umbrella")).toBeInTheDocument();
  });

  it("formats birthday as human-readable date", () => {
    render(<ProfileTab student={baseStudent} />);
    expect(screen.getByText("May 15, 2011")).toBeInTheDocument();
  });

  it("shows amber allergies badge when allergies are present", () => {
    render(<ProfileTab student={{ ...baseStudent, allergies: "Peanuts" }} />);
    expect(screen.getByText("Peanuts")).toHaveClass("bg-amber-100");
  });

  it("shows dash for empty allergies", () => {
    render(<ProfileTab student={baseStudent} />);
    // allergies field shows — when null
    const labels = screen.getAllByText("—");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("does not show Meals This Month for non-subscription student", () => {
    render(<ProfileTab student={baseStudent} />);
    expect(screen.queryByText(/Meals This Month/i)).not.toBeInTheDocument();
  });

  it("shows Meals This Month card for subscription student with status", () => {
    const subscriptionStudent: StudentSummary = {
      ...baseStudent,
      student_type: "subscription",
      subscription_monthly_status: {
        month: "june",
        year: 2026,
        categories: {
          meal: { allocated: 20, used: 5, remaining: 15 },
          snack: { allocated: 20, used: 3, remaining: 17 },
          drink: { allocated: 20, used: 2, remaining: 18 },
          extra: { allocated: 0, used: 0, remaining: 0 },
        },
      },
    };

    render(<ProfileTab student={subscriptionStudent} />);
    expect(screen.getByText(/Meals This Month/i)).toBeInTheDocument();
    expect(screen.getByText("15 remaining")).toBeInTheDocument();
  });
});
