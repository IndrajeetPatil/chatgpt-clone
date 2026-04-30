import type {
  AssistantModel,
  AssistantResponse,
  AssistantTemperature,
} from "@/client/types/assistant";
import {
  assistantRequestSchema,
  assistantResponseSchema,
} from "@/client/types/assistant";
import { logger } from "@/logger";

const log = logger.child({ module: "totoro" });

export default async function fetchAssistantResponse(
  url: string,
  model: AssistantModel,
  temperature: AssistantTemperature,
  prompt: string
): Promise<AssistantResponse> {
  const fullUrl = `${url}/api/v1/chat/${model}/?temperature=${temperature}`;
  const request = assistantRequestSchema.parse({ prompt });

  log.info(`Model: ${model}, Temperature: ${temperature}, Prompt: ${prompt}`);
  log.info(`Fetching assistant response from ${fullUrl}`);

  const response = await fetch(fullUrl, {
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorDetails = errorText ? `: ${errorText}` : "";
    throw new Error(
      `Assistant request failed with status ${response.status}${errorDetails}`
    );
  }

  return assistantResponseSchema.parse(await response.json());
}
