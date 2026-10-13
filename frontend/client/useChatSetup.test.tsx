import type { UIMessage } from "@ai-sdk/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vite-plus/test";
import type { MockInstance } from "vite-plus/test";

import { AssistantModel, ReasoningEffort } from "@/client/types/assistant";

import { useChatSetup } from "./useChatSetup";

// Drive the real AI SDK and stub only the network: the request this hook sends
// to the backend is the boundary it owns. Spying on `fetch` also avoids a
// browser-mode module mock of `@ai-sdk/react`, which intermittently failed to
// apply in CI.

type FetchSpy = MockInstance<typeof fetch>;

interface HookProps {
  model: AssistantModel;
  effort: ReasoningEffort;
}

const GREETING = {
  role: "assistant",
  parts: [
    { type: "text", text: "Hi, I am a chat bot. How can I help you today?" },
  ],
};

const USER_HELLO = { role: "user", parts: [{ type: "text", text: "hello" }] };

// A response whose body the test writes to and closes by hand.
function controlledResponse() {
  const body = new TextEncoderStream();
  const writer = body.writable.getWriter();
  return {
    response: new Response(body.readable),
    write: async (text: string) => writer.write(text),
    close: async () => writer.close(),
  };
}

// A fetch that stays pending until `respond` is called and, like the real one,
// rejects when its request is aborted.
function stubPendingFetch() {
  const reply = Promise.withResolvers<Response>();
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (_input, init) => {
      init?.signal?.addEventListener("abort", () => {
        reply.reject(new DOMException("Aborted", "AbortError"));
      });
      return reply.promise;
    });
  return { fetchSpy, respond: reply.resolve };
}

function requestTo(fetchSpy: FetchSpy, call = 0) {
  const [url, init] = fetchSpy.mock.calls[call] ?? [];
  const body: unknown =
    typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
  return { url, init, body };
}

function lastMessageText(messages: UIMessage[]) {
  const part = messages.at(-1)?.parts.find(({ type }) => type === "text");
  return part?.type === "text" ? part.text : undefined;
}

describe(useChatSetup, () => {
  test("starts with the greeting and no request in flight", () => {
    const { result } = renderHook(() =>
      useChatSetup(AssistantModel.ASTRA, ReasoningEffort.MEDIUM),
    );

    expect(result.current).toMatchObject({
      messages: [{ id: "initial-message", ...GREETING }],
      assistantIsLoading: false,
      hasUserMessage: false,
      error: undefined,
    });
  });

  test("posts the conversation with the selected model and reasoning effort", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("Hello!"));
    const { result } = renderHook(() =>
      useChatSetup(AssistantModel.ASTRA, ReasoningEffort.MEDIUM),
    );

    await act(async () => result.current.handleSendMessage("hello"));

    expect(fetchSpy).toHaveBeenCalledOnce();
    const { url, init, body } = requestTo(fetchSpy);
    expect(url).toBe("/api/v1/chat");
    expect(init?.method).toBe("POST");
    expect(body).toStrictEqual({
      model: AssistantModel.ASTRA,
      reasoning_effort: ReasoningEffort.MEDIUM,
      messages: [GREETING, USER_HELLO],
    });
    await waitFor(() => {
      expect(lastMessageText(result.current.messages)).toBe("Hello!");
    });
    expect(result.current).toMatchObject({ hasUserMessage: true });
  });

  test("reports loading while the reply is pending and while it streams", async () => {
    const { respond } = stubPendingFetch();
    const reply = controlledResponse();
    const { result } = renderHook(() =>
      useChatSetup(AssistantModel.ASTRA, ReasoningEffort.MEDIUM),
    );

    let sending = Promise.resolve();
    act(() => {
      sending = result.current.handleSendMessage("hello");
    });
    await waitFor(() => {
      expect(result.current).toMatchObject({ assistantIsLoading: true });
    });

    respond(reply.response);
    await reply.write("Hel");
    await waitFor(() => {
      expect(lastMessageText(result.current.messages)).toBe("Hel");
    });
    expect(result.current).toMatchObject({ assistantIsLoading: true });

    await reply.close();
    await act(async () => sending);
    expect(result.current).toMatchObject({ assistantIsLoading: false });
  });

  test("surfaces a failed request and stops loading", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Upstream failure", { status: 500 }),
    );
    const { result } = renderHook(() =>
      useChatSetup(AssistantModel.ASTRA, ReasoningEffort.MEDIUM),
    );

    await act(async () => result.current.handleSendMessage("hello"));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current).toMatchObject({ assistantIsLoading: false });
  });

  test("stop aborts the in-flight request", async () => {
    const { fetchSpy } = stubPendingFetch();
    const { result } = renderHook(() =>
      useChatSetup(AssistantModel.ASTRA, ReasoningEffort.LOW),
    );

    let sending = Promise.resolve();
    act(() => {
      sending = result.current.handleSendMessage("hello");
    });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    await act(async () => result.current.stop());
    await act(async () => sending);

    expect(requestTo(fetchSpy).init?.signal).toHaveProperty("aborted", true);
    expect(result.current).toMatchObject({ assistantIsLoading: false });
  });

  test("regenerating before the user has spoken sends nothing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() =>
      useChatSetup(AssistantModel.ASTRA, ReasoningEffort.MEDIUM),
    );

    await act(async () => result.current.handleRegenerateResponse());

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("regenerating resends the conversation with the current settings", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("First answer"))
      .mockResolvedValueOnce(new Response("Second answer"));
    const initialProps: HookProps = {
      model: AssistantModel.ASTRA,
      effort: ReasoningEffort.MEDIUM,
    };
    const { result, rerender } = renderHook(
      ({ model, effort }: HookProps) => useChatSetup(model, effort),
      { initialProps },
    );
    await act(async () => result.current.handleSendMessage("hello"));

    rerender({ model: AssistantModel.SOL, effort: ReasoningEffort.HIGH });
    await act(async () => result.current.handleRegenerateResponse());

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(requestTo(fetchSpy, 1).body).toStrictEqual({
      model: AssistantModel.SOL,
      reasoning_effort: ReasoningEffort.HIGH,
      messages: [GREETING, USER_HELLO],
    });
    await waitFor(() => {
      expect(lastMessageText(result.current.messages)).toBe("Second answer");
    });
    expect(result.current.messages).toHaveLength(3);
  });
});
