import { AssistantModel, AssistantTemperature } from "./assistant";

describe("assistant type values", () => {
  test("exposes supported assistant models", () => {
    expect(Object.values(AssistantModel)).toEqual(["gpt-4o", "gpt-4o-mini"]);
  });

  test("exposes supported assistant temperatures", () => {
    expect(Object.values(AssistantTemperature)).toEqual([
      "DETERMINISTIC",
      "BALANCED",
      "CREATIVE",
    ]);
  });
});
