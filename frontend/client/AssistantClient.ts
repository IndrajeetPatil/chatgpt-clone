import axios from "axios";

import { logger } from "@/utils/logger";

const log = logger.child({ module: "totoro" });

export default async function fetchAssistantResponse(
  url: string,
  model: string,
  temperature: number,
  prompt: string
) {
  log.debug(`Fetching assistant response from ${url}`);
  log.debug(`Model: ${model}, Temperature: ${temperature}, Prompt: ${prompt}`);
  const response = await axios.post(url, {
    model,
    temperature,
    prompt,
  });

  return response.data;
}
