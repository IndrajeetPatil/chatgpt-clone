import {
  AssistantModel,
  AssistantTemperature,
  assistantModelSchema,
  assistantRequestSchema,
  assistantResponseSchema,
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

  it("validates outgoing assistant requests", () => {
    expect(assistantRequestSchema.parse({ prompt: "Hello" })).toEqual({
      prompt: "Hello",
    });
    expect(() => assistantRequestSchema.parse({ prompt: "" })).toThrow();
  });

  it("validates assistant responses strictly", () => {
    expect(assistantResponseSchema.parse({ response: "Hello" })).toEqual({
      response: "Hello",
    });
    expect(() =>
      assistantResponseSchema.parse({ response: "Hello", extra: true })
    ).toThrow();
  });
});
