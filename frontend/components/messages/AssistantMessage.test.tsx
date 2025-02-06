import type React from "react";

import { ThemeProvider, createTheme } from "@mui/material";
import { type RenderResult, render, screen } from "@testing-library/react";

import AssistantMessage from "./AssistantMessage";

interface CodeBlockProps {
  text: string;
}

interface ReactMarkdownProps {
  children: string;
  components: {
    code: React.FC<CodeProps>;
  };
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Mock modules
jest.mock("react-code-blocks", () => ({
  CopyBlock: ({ text }: CodeBlockProps): JSX.Element => (
    <div data-testid="code-block">{text}</div>
  ),
  atomOneDark: {},
  atomOneLight: {},
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children, components }: ReactMarkdownProps): JSX.Element => {
    // Split content by code blocks and render appropriately
    const parts: string[] = children.split(/(```[\s\S]*?```)/);

    // Use a cumulative offset to generate a key that is derived from the content's position
    let cumulativeOffset = 0;

    return (
      <div data-testid="markdown-content">
        {parts.map((part: string) => {
          // Use the current cumulativeOffset as the key.
          // To ensure keys for empty strings are unique, always increment by at least 1.
          const key = `part-${cumulativeOffset}`;
          cumulativeOffset += part.length || 1;

          if (part.startsWith("```")) {
            const Code = components.code;
            // Remove the backticks and optional language identifier
            const codeContent: string = part.replace(/```\w*\n?|\n?```/g, "");
            return (
              <Code
                key={key}
                className="language-javascript"
              >
                {codeContent}
              </Code>
            );
          }
          return <span key={key}>{part}</span>;
        })}
      </div>
    );
  },
}));

interface WrapperProps {
  children: React.ReactNode;
}

// Wrapper component for providing required context
const Wrapper: React.FC<WrapperProps> = ({
  children,
}: WrapperProps): JSX.Element => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe("AssistantMessage", () => {
  test("renders plain text content", () => {
    const content = "This is a simple text message";
    render(
      <AssistantMessage
        content={content}
        isFirstMessage={false}
      />,
      {
        wrapper: Wrapper,
      }
    );

    const element = screen.getByTestId("markdown-content");
    expect(element).toHaveTextContent(content);
  });

  test("renders code block content", () => {
    const content = '```javascript\nconsole.log("hello");\n```';
    render(
      <AssistantMessage
        content={content}
        isFirstMessage={false}
      />,
      {
        wrapper: Wrapper,
      }
    );

    const markdownElement = screen.getByTestId("markdown-content");
    const codeElement = screen.getByTestId("code-block");

    expect(markdownElement).toBeInTheDocument();
    expect(codeElement).toBeInTheDocument();
  });

  test("renders inline code within text", () => {
    const content = "Use the `console.log()` function";
    render(
      <AssistantMessage
        content={content}
        isFirstMessage={false}
      />,
      {
        wrapper: Wrapper,
      }
    );

    const element = screen.getByTestId("markdown-content");
    expect(element).toHaveTextContent(content);
  });

  test("renders mixed content with code blocks and text", () => {
    const content =
      'Here is some code:\n```javascript\nconsole.log("hello");\n```\nAnd more text';
    const { container }: RenderResult = render(
      <AssistantMessage
        content={content}
        isFirstMessage={false}
      />,
      { wrapper: Wrapper }
    );

    expect(container).toMatchSnapshot();
  });

  test("handles empty content", () => {
    render(
      <AssistantMessage
        content=""
        isFirstMessage={false}
      />,
      {
        wrapper: Wrapper,
      }
    );

    const element = screen.getByTestId("markdown-content");
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent("");
  });
});
