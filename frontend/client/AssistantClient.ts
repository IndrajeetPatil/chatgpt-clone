import axios from "axios";

export default async function fetchAssistantResponse(
  url: string,
  model: string,
  temperature: number,
  prompt: string
) {
  const response = await axios.post(url, {
    model,
    temperature,
    prompt,
  });

  return response.data;
}
