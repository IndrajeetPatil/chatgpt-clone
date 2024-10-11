import { AssistantModel, AssistantTemperature } from "./types/assistant";

const getModelDisplay = (model: AssistantModel) =>
  model === AssistantModel.FULL ? "GPT-4o" : "GPT-4o Mini";

const getTemperatureDisplay = (temperature: AssistantTemperature) => {
  switch (temperature) {
    case AssistantTemperature.DETERMINISTIC:
      return "0.2 - More Deterministic";
    case AssistantTemperature.BALANCED:
      return "0.7 - Balanced";
    case AssistantTemperature.CREATIVE:
      return "0.9 - More Creative";
    default:
      return "";
  }
};

export { getModelDisplay, getTemperatureDisplay };
