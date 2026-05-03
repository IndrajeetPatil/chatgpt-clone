import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Hoist mock functions so they can be used inside vi.mock factories
const { mockSendMessage, mockRegenerate, mockUseChat } = vi.hoisted(() => ({
  mockSendMessage: vi.fn().mockResolvedValue(undefined),
  mockRegenerate: vi.fn().mockResolvedValue(undefined),
  mockUseChat: vi.fn(),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: mockUseChat,
}));

vi.mock("ai", () => ({
  TextStreamChatTransport: class {},
}));

// Mock child components so we can test page.tsx logic in isolation
vi.mock("@/components/messages/AssistantMessage", () => ({
  default: ({
    content,
    isFirstMessage,
  }: {
    content: string;
    isFirstMessage: boolean;
  }) => (
    <div
      data-testid="assistant-message"
      data-first-message={String(isFirstMessage)}
    >
      {content}
    </div>
  ),
}));

vi.mock("@/components/messages/UserMessage", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="user-message">{content}</div>
  ),
}));

vi.mock("@/components/messages/ChatInput", () => ({
  default: ({
    onSendMessage,
    disabled,
  }: {
    onSendMessage: (msg: string) => Promise<void>;
    disabled: boolean;
  }) => (
    <button
      type="button"
      data-testid="chat-input-send"
      data-disabled={String(disabled)}
      onClick={() => void onSendMessage("test message")}
    >
      Send
    </button>
  ),
}));

vi.mock("@/components/parameters/DropdownParameter", () => ({
  default: ({
    onChange,
    ariaLabel,
    options,
    value,
  }: {
    onChange: (v: string) => void;
    ariaLabel: string;
    options: Array<{ value: string; label: string }>;
    value: string;
  }) => (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
        >
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

import Home from "./page";

type TestMessage = {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
};

const INITIAL_MESSAGES = [
  {
    id: "initial-message",
    role: "assistant" as const,
    parts: [
      {
        type: "text" as const,
        text: "Hi, I am a chat bot. How can I help you today?",
      },
    ],
  },
];

const WITH_USER_MESSAGE: TestMessage[] = [
  ...INITIAL_MESSAGES,
  {
    id: "u1",
    role: "user" as const,
    parts: [{ type: "text" as const, text: "Hi" }],
  },
];

function setupChat(
  overrides: Partial<{
    messages: TestMessage[];
    status: string;
    error: Error | undefined;
  }> = {},
) {
  mockUseChat.mockReturnValue({
    messages: INITIAL_MESSAGES,
    sendMessage: mockSendMessage,
    regenerate: mockRegenerate,
    error: undefined,
    status: "idle",
    ...overrides,
  });
}

describe("Home page", () => {
  beforeEach(() => {
    setupChat();
  });

  test("renders initial assistant message marked as first message", () => {
    render(<Home />);
    const msg = screen.getByTestId("assistant-message");
    expect(msg).toHaveTextContent("Hi, I am a chat bot");
    expect(msg).toHaveAttribute("data-first-message", "true");
  });

  test("renders main landmark, page heading, and skip link", () => {
    render(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Chatbot Template",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Skip to Message" }),
    ).toHaveAttribute("href", "#message-input");
  });

  test("renders user messages via renderMessage", () => {
    setupChat({
      messages: [
        ...INITIAL_MESSAGES,
        {
          id: "u1",
          role: "user" as const,
          parts: [{ type: "text" as const, text: "Hello bot" }],
        },
      ],
    });
    render(<Home />);
    expect(screen.getByTestId("user-message")).toHaveTextContent("Hello bot");
  });

  test("shows CircularProgress when status is submitted", () => {
    setupChat({ status: "submitted" });
    render(<Home />);
    expect(screen.getByRole("status")).toHaveTextContent("Generating…");
  });

  test("shows CircularProgress when status is streaming", () => {
    setupChat({ status: "streaming" });
    render(<Home />);
    expect(screen.getByRole("status")).toHaveTextContent("Generating…");
  });

  test("shows error Alert when error is present", () => {
    setupChat({ error: new Error("Network error") });
    render(<Home />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong. Try sending your message again. Details: Network error",
    );
  });

  test("starts in dark mode (toggle shows Switch to light mode)", () => {
    render(<Home />);
    expect(screen.getByLabelText("Switch to light mode")).toBeInTheDocument();
  });

  test("toggles from dark to light mode", () => {
    render(<Home />);
    fireEvent.click(screen.getByLabelText("Switch to light mode"));
    expect(screen.getByLabelText("Switch to dark mode")).toBeInTheDocument();
  });

  test("regenerate button is disabled when no user messages", () => {
    render(<Home />);
    expect(screen.getByLabelText("Regenerate response")).toBeDisabled();
  });

  test("regenerate invokes chat retry when there is a user message and not loading", () => {
    setupChat({ messages: WITH_USER_MESSAGE });
    render(<Home />);
    fireEvent.click(screen.getByLabelText("Regenerate response"));
    expect(mockRegenerate).toHaveBeenCalledTimes(1);
  });

  test("regenerate does not fire when disabled (loading)", () => {
    setupChat({ status: "streaming", messages: WITH_USER_MESSAGE });
    render(<Home />);
    fireEvent.click(screen.getByLabelText("Regenerate response"));
    expect(mockRegenerate).not.toHaveBeenCalled();
  });

  test("syncs browser chrome metadata with the selected theme", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);

    render(<Home />);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(meta.content).toBe("#121212");

    fireEvent.click(screen.getByLabelText("Switch to light mode"));
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(meta.content).toBe("#ffffff");

    meta.remove();
  });

  test("sends message from the chat input", async () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("chat-input-send"));
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  test("updates model selection from the dropdown", async () => {
    render(<Home />);
    const modelSelect = screen.getByLabelText(/Select assistant model/i);
    fireEvent.change(modelSelect, { target: { value: "gpt-4o-mini" } });
    expect(modelSelect).toHaveValue("gpt-4o-mini");
  });

  test("updates temperature selection from the dropdown", async () => {
    render(<Home />);
    const tempSelect = screen.getByLabelText(/Select assistant temperature/i);
    fireEvent.change(tempSelect, { target: { value: "CREATIVE" } });
    expect(tempSelect).toHaveValue("CREATIVE");
  });

  test("non-text message parts yield empty string in renderMessage", () => {
    setupChat({
      messages: [
        {
          id: "a1",
          role: "assistant" as const,
          parts: [{ type: "step-start" }],
        },
      ],
    });
    render(<Home />);
    // Should render without crashing; non-text parts map to ""
    const msg = screen.getByTestId("assistant-message");
    expect(msg).toHaveTextContent("");
  });
});
