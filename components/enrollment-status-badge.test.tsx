import { render, screen } from "@/__tests__/test-utils";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";

import type { StudentSummary } from "@/types/portal";

// Every case of the backend's App\Enums\EnrollmentStatus, with its label().
const backendStatuses: [StudentSummary["enrollment_status"], string][] = [
  ["enrolled", "Enrolled"],
  ["paused", "Paused"],
  ["unenrolled", "Unenrolled"],
  ["banned", "Banned"],
  ["graduated", "Graduated"],
];

describe("EnrollmentStatusBadge", () => {
  it.each(backendStatuses)("shows the label for %s", (status, label) => {
    render(<EnrollmentStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
