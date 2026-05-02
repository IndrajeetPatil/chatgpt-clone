import { createTheme, ThemeProvider } from "@mui/material";
import { type RenderResult, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";

import AssistantMessage from "./AssistantMessage";

interface MockComponents {
  pre: React.FC<{ children?: React.ReactNode }>;
  code: React.FC<{ className?: string; children?: React.ReactNode }>;
}

vi.mock("react-markdown", () => ({
  __esModule: true,
  default: ({
    children,
    components,
  }: {
    children: string;
    components: MockComponents;
  }): React.JSX.Element => {
    const parts = children.split(/(```[\s\S]*?```)/);
    let offset = 0;

    return (
      <div data-testid="markdown-content">
        {parts.map((part) => {
          const key = `part-${offset}`;
          offset += part.length || 1;

          if (part.startsWith("```")) {
            const Pre = components.pre;
            const Code = components.code;
            const lang = part.match(/^```(\w*)/)?.[1];
            const className = lang ? `language-${lang}` : undefined;
            const codeContent = part.replace(/```\w*\n?|\n?```/g, "");
            return (
              <Pre key={key}>
                <Code className={className}>{codeContent}</Code>
              </Pre>
            );
          }
          return <span key={key}>{part}</span>;
        })}
      </div>
    );
  },
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}): React.JSX.Element => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe("AssistantMessage", () => {
  test.each([
    ["plain text", "This is a simple text message"],
    ["empty content", ""],
    ["inline code", "Use the `console.log()` function"],
  ])("renders %s without error", (_label, content) => {
    render(
      <AssistantMessage
        content={content}
        isFirstMessage={false}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
  });

  test("renders code block with block container", () => {
    render(
      <AssistantMessage
        content={'```javascript\nconsole.log("hello");\n```'}
        isFirstMessage={false}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    expect(screen.getByTestId("code-block")).toBeInTheDocument();
  });

  test.each([
    ["plain text snapshot", "Hello, this is a plain message.", false],
    [
      "mixed content snapshot",
      'Here is some code:\n```javascript\nconsole.log("hello");\n```\nAnd more text',
      false,
    ],
  ])("matches snapshot for %s", (_label, content, isFirstMessage) => {
    const { container }: RenderResult = render(
      <AssistantMessage
        content={content}
        isFirstMessage={isFirstMessage}
      />,
      { wrapper: Wrapper }
    );
    expect(container).toMatchSnapshot();
  });

  test("does not show copy button when isFirstMessage is true", () => {
    const { queryByRole } = render(
      <AssistantMessage
        content="Welcome!"
        isFirstMessage={true}
      />,
      { wrapper: Wrapper }
    );
    expect(queryByRole("button")).not.toBeInTheDocument();
  });

  test("shows copy button when isFirstMessage is false", () => {
    const { getByRole } = render(
      <AssistantMessage
        content="A response"
        isFirstMessage={false}
      />,
      { wrapper: Wrapper }
    );
    expect(getByRole("button")).toBeInTheDocument();
  });

  test("copy button calls clipboard writeText on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const { getByRole } = render(
      <AssistantMessage
        content="Copy me!"
        isFirstMessage={false}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("Copy me!");
  });
});
