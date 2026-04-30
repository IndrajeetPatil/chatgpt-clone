import {
  AssistantModel,
  AssistantTemperature,
  assistantModelSchema,
  assistantTemperatureSchema,
} from "./assistant";

describe("assistant schemas", () => {
  it("accepts supported assistant model and temperature values", () => {
    expect(assistantModelSchema.parse(AssistantModel.FULL)).toBe(
      AssistantModel.FULL
    );
    expect(
      assistantTemperatureSchema.parse(AssistantTemperature.BALANCED)
    ).toBe(AssistantTemperature.BALANCED);
  });

  it("rejects unsupported assistant model and temperature values", () => {
    expect(() => assistantModelSchema.parse("gpt-3.5")).toThrow();
    expect(() => assistantTemperatureSchema.parse("HOT")).toThrow();
  });
});
