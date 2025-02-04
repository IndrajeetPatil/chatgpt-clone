import type React from "react";

import { ThemeProvider, createTheme } from "@mui/material";
import { type RenderResult, render, screen } from "@testing-library/react";

import AssistantMessage from "./AssistantMessage";

interface CodeBlockProps {
  text: string;
  language?: string;
  codeBlock?: boolean;
  theme?: Record<string, unknown>;
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
    return (
      <div data-testid="markdown-content">
        {parts.map((part: string, index: number) => {
          if (part.startsWith("```")) {
            const Code = components.code;
            const codeContent: string = part.replace(/```\w*\n?|\n?```/g, "");
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
    render(<AssistantMessage content={content} isFirstMessage={false} />, {
      wrapper: Wrapper,
    });

    const element = screen.getByTestId("markdown-content");
    expect(element).toHaveTextContent(content);
  });

  test("renders code block content", () => {
    const content = '```javascript\nconsole.log("hello");\n```';
    render(<AssistantMessage content={content} isFirstMessage={false} />, {
      wrapper: Wrapper,
    });

    const markdownElement = screen.getByTestId("markdown-content");
    const codeElement = screen.getByTestId("code-block");

    expect(markdownElement).toBeInTheDocument();
    expect(codeElement).toBeInTheDocument();
  });

  test("renders inline code within text", () => {
    const content = "Use the `console.log()` function";
    render(<AssistantMessage content={content} isFirstMessage={false} />, {
      wrapper: Wrapper,
    });

    const element = screen.getByTestId("markdown-content");
    expect(element).toHaveTextContent(content);
  });

  test("renders mixed content with code blocks and text", () => {
    const content =
      'Here is some code:\n```javascript\nconsole.log("hello");\n```\nAnd more text';
    const { container }: RenderResult = render(
      <AssistantMessage content={content} isFirstMessage={false} />,
      { wrapper: Wrapper }
    );

    expect(container).toMatchSnapshot();
  });

  test("handles empty content", () => {
    render(<AssistantMessage content="" isFirstMessage={false} />, {
      wrapper: Wrapper,
    });

    const element = screen.getByTestId("markdown-content");
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent("");
  });
});
