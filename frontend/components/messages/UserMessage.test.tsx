import React from "react";
import { render } from "@testing-library/react";
import UserMessage from "./UserMessage";

// Mock Material-UI components to simplify snapshot
jest.mock("@mui/material", () => ({
  Box: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="mock-box" {...props}>
      {children}
    </div>
  ),
  Paper: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="mock-paper" {...props}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="mock-typography" {...props}>
      {children}
    </div>
  ),
  useTheme: () => ({
    palette: {
      mode: "light",
    },
  }),
}));

// Mock PersonIcon
jest.mock("@mui/icons-material/Person", () => () => (
  <span data-testid="mock-person-icon">PersonIcon</span>
));

describe("UserMessage", () => {
  it("renders user message with person icon correctly", () => {
    const testContent = "Hello, world!";
    const { asFragment } = render(<UserMessage content={testContent} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
