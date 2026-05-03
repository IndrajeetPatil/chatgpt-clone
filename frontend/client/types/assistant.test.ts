import {
  AssistantModel,
  AssistantTemperature,
  assistantModelSchema,
  assistantTemperatureSchema,
} from "./assistant";

describe("assistantModelSchema", () => {
  test.each(
    Object.values(AssistantModel),
  )("accepts valid model %s", (model) => {
    expect(assistantModelSchema.parse(model)).toBe(model);
  });

  test.each([
    "gpt-3.5",
    "gpt-4",
    "invalid",
    "",
  ])("rejects invalid model %s", (value) => {
    expect(() => assistantModelSchema.parse(value)).toThrow();
  });
});

describe("assistantTemperatureSchema", () => {
  test.each(
    Object.values(AssistantTemperature),
  )("accepts valid temperature %s", (temperature) => {
    expect(assistantTemperatureSchema.parse(temperature)).toBe(temperature);
  });

  test.each([
    "HOT",
    "COLD",
    "0.7",
    "balanced",
    "",
  ])("rejects invalid temperature %s", (value) => {
    expect(() => assistantTemperatureSchema.parse(value)).toThrow();
  });
});
