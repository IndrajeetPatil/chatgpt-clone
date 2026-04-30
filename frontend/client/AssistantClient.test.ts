import { vi } from "vitest";

Object.assign(globalThis, {
  setImmediate: (callback: (...args: unknown[]) => void, ...args: unknown[]) =>
    setTimeout(callback, 0, ...args),
});

import fetchAssistantResponse from "./AssistantClient";
import { AssistantModel, AssistantTemperature } from "./types/assistant";

const fetchMock = vi.fn();

function createFetchResponse({
  body,
  ok,
  status,
}: {
  body: unknown;
  ok: boolean;
  status: number;
}): Response {
  return {
    json: vi.fn().mockResolvedValue(body),
    ok,
    status,
    text: vi.fn().mockResolvedValue(String(body)),
  } as unknown as Response;
}

describe("fetchAssistantResponse", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it("posts the assistant request with native fetch", async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({
        body: { response: "Hello" },
        ok: true,
        status: 200,
      })
    );

    await expect(
      fetchAssistantResponse(
        "http://localhost:8000",
        AssistantModel.MINI,
        AssistantTemperature.BALANCED,
        "Hi"
      )
    ).resolves.toEqual({ response: "Hello" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/chat/gpt-4o-mini/?temperature=BALANCED",
      {
        body: JSON.stringify({ prompt: "Hi" }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );
  });

  it("throws when the assistant request fails", async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({
        body: "Bad request",
        ok: false,
        status: 400,
      })
    );

    await expect(
      fetchAssistantResponse(
        "http://localhost:8000",
        AssistantModel.FULL,
        AssistantTemperature.DETERMINISTIC,
        "Hi"
      )
    ).rejects.toThrow("Assistant request failed with status 400: Bad request");
  });
});
