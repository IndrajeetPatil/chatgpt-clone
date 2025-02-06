import useSWRMutation from "swr/mutation";

import type {
  AssistantModel,
  AssistantTemperature,
} from "@/client/types/assistant";

import fetchAssistantResponse from "../AssistantClient.tsx";

interface AssistantResponseArgs {
  model: AssistantModel;
  temperature: AssistantTemperature;
  prompt: string;
}

export default function useAssistantResponse() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "assistant-response", // A unique key for the mutation
    (_, { arg }: { arg: AssistantResponseArgs }) =>
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
