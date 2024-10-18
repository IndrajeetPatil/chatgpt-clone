import React from "react";
import { render, screen } from "@testing-library/react";
import AssistantMessage from "./AssistantMessage";
import { ThemeProvider, createTheme } from "@mui/material";

// Mock modules
jest.mock("react-code-blocks", () => ({
  CopyBlock: ({ text }: { text: string }) => (
    <div data-testid="code-block">{text}</div>
  ),
  atomOneDark: {},
  atomOneLight: {},
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({
    children,
    components,
  }: {
    children: string;
    components: any;
  }) => {
    // Split content by code blocks and render appropriately
    const parts = children.split(/(```[\s\S]*?```)/);
    return (
      <div data-testid="markdown-content">
        {parts.map((part, index) => {
          if (part.startsWith("```")) {
            const Code = components.code;
            const codeContent = part.replace(/```\w*\n?|\n?```/g, "");
            return (
              <Code key={index} className="language-javascript">
                {codeContent}
              </Code>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  },
}));

// Wrapper component for providing required context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe("AssistantMessage", () => {
  test("renders plain text content", () => {
    const content = "This is a simple text message";
    render(<AssistantMessage content={content} isFirstMessage={false} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId("markdown-content")).toHaveTextContent(content);
  });

  test("renders code block content", () => {
    const content = '```javascript\nconsole.log("hello");\n```';
    render(<AssistantMessage content={content} isFirstMessage={false} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    expect(screen.getByTestId("code-block")).toBeInTheDocument();
  });

  test("renders inline code within text", () => {
    const content = "Use the `console.log()` function";
    render(<AssistantMessage content={content} isFirstMessage={false} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId("markdown-content")).toHaveTextContent(
      "Use the `console.log()` function"
    );
  });

  test("renders mixed content with code blocks and text", () => {
    const content =
      'Here is some code:\n```javascript\nconsole.log("hello");\n```\nAnd more text';
    const { container } = render(
      <AssistantMessage content={content} isFirstMessage={false} />,
      { wrapper: Wrapper }
    );

    expect(container).toMatchSnapshot();
  });

  test("handles empty content", () => {
    render(<AssistantMessage content="" isFirstMessage={false} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-content")).toHaveTextContent("");
  });
});
