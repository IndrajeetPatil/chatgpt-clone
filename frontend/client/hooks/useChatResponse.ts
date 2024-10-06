import useSWR from "swr";
import fetchChatResponse from "../ChatClient";

export default function useChatResponse(
  model: string,
  temperature: number,
  prompt: string
) {
  const { data, error, isLoading } = useSWR(
    ["http://localhost:8000/", model, temperature, prompt],
    ([_, model, temperature, prompt]) =>
      fetchChatResponse(_, model, temperature, prompt)
  );

  return {
    assistantResponse: data,
    assistantError: error,
    assistantIsLoading: isLoading,
  };
}
