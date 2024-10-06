import useSWRMutation from 'swr/mutation';
import fetchAssistantResponse from '../AssistantClient';

interface AssistantResponseArgs {
  model: string;
  temperature: number;
  prompt: string;
}

export default function useAssistantResponse() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    'assistant-response', // A unique key for the mutation
    (_, { arg }: { arg: AssistantResponseArgs }) =>
      fetchAssistantResponse('http://localhost:8000/', arg.model, arg.temperature, arg.prompt)
  );

  return {
    triggerAssistantResponse: trigger,
    assistantResponse: data,
    assistantError: error,
    assistantIsLoading: isMutating,
  };
}
