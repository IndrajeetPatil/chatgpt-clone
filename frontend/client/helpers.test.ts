import { getModelDisplay, getTemperatureDisplay } from "./helpers";
import { AssistantModel, AssistantTemperature } from "./types/assistant";

describe("getModelDisplay", () => {
  test.each([
    [AssistantModel.FULL, "GPT-4o"],
    [AssistantModel.MINI, "GPT-4o Mini"],
  ])("returns %s for model %s", (model, expected) => {
    expect(getModelDisplay(model)).toBe(expected);
  });
});

describe("getTemperatureDisplay", () => {
  test.each([
    [AssistantTemperature.DETERMINISTIC, "0.2 - More Deterministic"],
    [AssistantTemperature.BALANCED, "0.7 - Balanced"],
    [AssistantTemperature.CREATIVE, "0.9 - More Creative"],
  ])("returns %s for temperature %s", (temp, expected) => {
    expect(getTemperatureDisplay(temp)).toBe(expected);
  });
});
