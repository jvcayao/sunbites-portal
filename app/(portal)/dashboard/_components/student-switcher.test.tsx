import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { StudentSwitcher, STUDENT_COLORS } from "./student-switcher";

const students = [
  { id: 1, full_name: "Juan Cayao" },
  { id: 2, full_name: "Maria Cayao" },
];

describe("StudentSwitcher", () => {
  it("renders one button per student using first name only", () => {
    render(
      <StudentSwitcher students={students} activeIndex={0} onSelect={() => {}} />
    );
    expect(screen.getByRole("button", { name: /juan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /maria/i })).toBeInTheDocument();
  });

  it("calls onSelect with the correct index when clicked", async () => {
    const onSelect = jest.fn();
    render(
      <StudentSwitcher students={students} activeIndex={0} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole("button", { name: /maria/i }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("applies student color as background on the active button", () => {
    render(
      <StudentSwitcher students={students} activeIndex={0} onSelect={() => {}} />
    );
    const activeBtn = screen.getByRole("button", { name: /juan/i });
    expect(activeBtn).toHaveStyle({ backgroundColor: STUDENT_COLORS[0] });
  });

  it("does not apply background color to inactive buttons", () => {
    render(
      <StudentSwitcher students={students} activeIndex={0} onSelect={() => {}} />
    );
    const inactiveBtn = screen.getByRole("button", { name: /maria/i });
    expect(inactiveBtn).not.toHaveStyle({ backgroundColor: STUDENT_COLORS[1] });
  });
});
