import { fireEvent, render, screen } from "@testing-library/react";

import DropdownParameter from "./DropdownParameter";

const OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
];

describe("DropdownParameter", () => {
  test("renders trigger button with correct aria-label", () => {
    render(
      <DropdownParameter
        value="opt1"
        onChange={vi.fn()}
        icon={<span>icon</span>}
        tooltipTitle="Select option"
        ariaLabel="Select an option"
        options={OPTIONS}
      />,
    );
    expect(screen.getByLabelText("Select an option")).toBeInTheDocument();
  });

  test("menu is closed initially", () => {
    render(
      <DropdownParameter
        value="opt1"
        onChange={vi.fn()}
        icon={<span>icon</span>}
        tooltipTitle="Select"
        ariaLabel="Select an option"
        options={OPTIONS}
      />,
    );
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
  });

  test("opens menu and shows all options when button is clicked", () => {
    render(
      <DropdownParameter
        value="opt1"
        onChange={vi.fn()}
        icon={<span>icon</span>}
        tooltipTitle="Select"
        ariaLabel="Select an option"
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select an option"));
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  test("calls onChange with selected value", () => {
    const onChange = vi.fn();
    render(
      <DropdownParameter
        value="opt1"
        onChange={onChange}
        icon={<span>icon</span>}
        tooltipTitle="Select"
        ariaLabel="Select an option"
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select an option"));
    fireEvent.click(screen.getByText("Option 2"));
    expect(onChange).toHaveBeenCalledWith("opt2");
  });
});
