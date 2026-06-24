import { render, screen } from "@/__tests__/test-utils";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";
import { PaymentHistoryTimeline } from "./payment-history-timeline";
import type { StudentSummary } from "@/types/portal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const student = {
  id: 1,
  full_name: "Juan Cayao",
  student_type: "subscription",
} as StudentSummary;

describe("PaymentHistoryTimeline", () => {
  it("shows month abbreviation for each payment entry", async () => {
    render(<PaymentHistoryTimeline student={student} color="#F97316" />);
    expect(await screen.findByText("Feb")).toBeInTheDocument();
    expect(await screen.findByText("Apr")).toBeInTheDocument();
  });

  it("shows 'Unpaid' label for unpaid entries", async () => {
    render(<PaymentHistoryTimeline student={student} color="#F97316" />);
    expect(await screen.findByText("Unpaid")).toBeInTheDocument();
  });

  it("shows Overdue badge when current month is unpaid", async () => {
    server.use(
      http.get(`${API}/portal/students/:id/payment-history`, () =>
        HttpResponse.json({
          data: [
            {
              id: 1,
              school_month: "june",
              year: new Date().getFullYear(),
              amount: 2500,
              status: "unpaid",
              paid_at: null,
            },
          ],
        }),
      ),
    );
    render(<PaymentHistoryTimeline student={student} color="#F97316" />);
    expect(await screen.findByText("Overdue")).toBeInTheDocument();
  });

  it("renders at most 5 payment cards even when more records exist", async () => {
    server.use(
      http.get(`${API}/portal/students/:id/payment-history`, () =>
        HttpResponse.json({
          data: [
            {
              id: 1,
              school_month: "june",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-06-01T00:00:00Z",
            },
            {
              id: 2,
              school_month: "july",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-07-01T00:00:00Z",
            },
            {
              id: 3,
              school_month: "august",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-08-01T00:00:00Z",
            },
            {
              id: 4,
              school_month: "september",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-09-01T00:00:00Z",
            },
            {
              id: 5,
              school_month: "october",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-10-01T00:00:00Z",
            },
            {
              id: 6,
              school_month: "november",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-11-01T00:00:00Z",
            },
            {
              id: 7,
              school_month: "december",
              year: 2025,
              amount: 2500,
              status: "paid",
              paid_at: "2025-12-01T00:00:00Z",
            },
          ],
        }),
      ),
    );
    render(<PaymentHistoryTimeline student={student} color="#F97316" />);
    await screen.findByText("Aug"); // wait for data to load
    // Only 5 cards: aug, sep, oct, nov, dec (last 5)
    expect(screen.queryByText("Jun")).not.toBeInTheDocument();
    expect(screen.queryByText("Jul")).not.toBeInTheDocument();
  });
});
