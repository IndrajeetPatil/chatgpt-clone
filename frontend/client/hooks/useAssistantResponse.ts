import useSWRMutation from "swr/mutation";

import type {
  AssistantModel,
  AssistantResponse,
  AssistantTemperature,
} from "@/client/types/assistant";

import fetchAssistantResponse from "../AssistantClient";

interface AssistantResponseArgs {
  model: AssistantModel;
  temperature: AssistantTemperature;
  prompt: string;
}

export default function useAssistantResponse() {
  const { trigger, data, error, isMutating } = useSWRMutation<
    AssistantResponse,
    Error,
    string,
    AssistantResponseArgs
  >("assistant-response", (_, { arg }) =>
    fetchAssistantResponse(
      "http://localhost:8000",
      arg.model,
      arg.temperature,
      arg.prompt
    )
  );

  return {
    triggerAssistantResponse: trigger,
    assistantResponse: data,
    assistantError: error,
    assistantIsLoading: isMutating,
  };
}
