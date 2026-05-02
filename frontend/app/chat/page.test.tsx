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
  }> = {}
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
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("shows CircularProgress when status is streaming", () => {
    setupChat({ status: "streaming" });
    render(<Home />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("shows error Alert when error is present", () => {
    setupChat({ error: new Error("Network error") });
    render(<Home />);
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
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

  test("regenerate button is aria-disabled when no user messages", () => {
    render(<Home />);
    expect(screen.getByLabelText("Regenerate response")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  test("regenerate calls callback when there is a user message and not loading", () => {
    setupChat({ messages: WITH_USER_MESSAGE });
    render(<Home />);
    fireEvent.click(screen.getByLabelText("Regenerate response"));
    expect(mockRegenerate).toHaveBeenCalledWith({
      body: { model: "gpt-4o", temperature: "BALANCED" },
    });
  });

  test("regenerate does not fire when disabled (loading)", () => {
    setupChat({ status: "streaming", messages: WITH_USER_MESSAGE });
    render(<Home />);
    fireEvent.click(screen.getByLabelText("Regenerate response"));
    expect(mockRegenerate).not.toHaveBeenCalled();
  });

  test("sends message with current model and temperature", async () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("chat-input-send"));
    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "test message" },
      { body: { model: "gpt-4o", temperature: "BALANCED" } }
    );
  });

  test("sends message with updated model after dropdown change", async () => {
    render(<Home />);
    const modelSelect = screen.getByLabelText(/Select assistant model/i);
    fireEvent.change(modelSelect, { target: { value: "gpt-4o-mini" } });
    fireEvent.click(screen.getByTestId("chat-input-send"));
    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "test message" },
      { body: { model: "gpt-4o-mini", temperature: "BALANCED" } }
    );
  });

  test("sends message with updated temperature after dropdown change", async () => {
    render(<Home />);
    const tempSelect = screen.getByLabelText(/Select assistant temperature/i);
    fireEvent.change(tempSelect, { target: { value: "CREATIVE" } });
    fireEvent.click(screen.getByTestId("chat-input-send"));
    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "test message" },
      { body: { model: "gpt-4o", temperature: "CREATIVE" } }
    );
  });

  test("non-text message parts yield empty string in renderMessage", () => {
    setupChat({
      messages: [
        {
          id: "a1",
          role: "assistant" as const,
          // biome-ignore lint/suspicious/noExplicitAny: mock data for non-text part
          parts: [{ type: "tool-invocation" as any, text: undefined as any }],
        },
      ],
    });
    render(<Home />);
    // Should render without crashing; non-text parts map to ""
    const msg = screen.getByTestId("assistant-message");
    expect(msg).toHaveTextContent("");
  });
});
