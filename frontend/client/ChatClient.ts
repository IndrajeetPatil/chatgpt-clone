"use server";

import getChatRespose from "../server/external-api";

export default async function fetchChatResponse(
  url: string,
  model: string,
  temperature: number,
  prompt: string
) {
  getChatRespose(url, model, temperature, prompt);
}
