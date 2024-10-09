import axios from "axios";

import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";
import { logger } from "@/utils/logger";

const log = logger.child({ module: "totoro" });

export default async function fetchAssistantResponse(
  url: string,
  model: AssistantModel,
  temperature: AssistantTemperature,
  prompt: string
) {
  const fullUrl = `${url}/api/v1/chat/${model}/?temperature=${temperature}`;

  log.debug(`Model: ${model}, Temperature: ${temperature}, Prompt: ${prompt}`);
  log.debug(`Fetching assistant response from ${fullUrl}`);

  const response = await axios.post(fullUrl, {
    prompt,
  });

  return response.data;
}
