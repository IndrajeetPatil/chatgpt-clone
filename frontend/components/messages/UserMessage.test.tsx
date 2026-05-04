import { render } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";

import UserMessage from "./UserMessage";

const { mockUseTheme } = vi.hoisted(() => ({
  mockUseTheme: vi.fn(() => ({
    palette: {
      mode: "light",
    },
  })),
}));

vi.mock("@mui/material", () => ({
  Box: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div
      data-testid="mock-box"
      {...props}
    >
      {children}
    </div>
  ),
  Paper: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div
      data-testid="mock-paper"
      {...props}
    >
      {children}
    </div>
  ),
  Typography: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div
      data-testid="mock-typography"
      {...props}
    >
      {children}
    </div>
  ),
  useTheme: mockUseTheme,
}));

vi.mock("@mui/icons-material/Person", () => {
  const MockPersonIcon = () => (
    <span data-testid="mock-person-icon">PersonIcon</span>
  );
  MockPersonIcon.displayName = "PersonIcon";
  return { default: MockPersonIcon };
});

describe("UserMessage", () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      palette: {
        mode: "light",
      },
    });
  });

  it("renders in dark mode", () => {
    mockUseTheme.mockReturnValue({
      palette: {
        mode: "dark",
      },
    });

    const { getByText } = render(<UserMessage content="Dark mode message" />);
    expect(getByText("Dark mode message")).toBeInTheDocument();
  });
});
