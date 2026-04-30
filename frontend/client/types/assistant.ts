import { z } from "zod";

export const assistantModelSchema = z.enum(["gpt-4o", "gpt-4o-mini"]);
export type AssistantModel = z.infer<typeof assistantModelSchema>;

export const AssistantModel = {
  FULL: "gpt-4o",
  MINI: "gpt-4o-mini",
} as const satisfies Record<string, AssistantModel>;

export const assistantTemperatureSchema = z.enum([
  "DETERMINISTIC", // 0.2 - More Deterministic
  "BALANCED", // 0.7 - Balanced
  "CREATIVE", // 0.9 - More Creative
]);
export type AssistantTemperature = z.infer<typeof assistantTemperatureSchema>;

export const AssistantTemperature = {
  DETERMINISTIC: "DETERMINISTIC",
  BALANCED: "BALANCED",
  CREATIVE: "CREATIVE",
} as const satisfies Record<string, AssistantTemperature>;

export const assistantRequestSchema = z.strictObject({
  prompt: z.string().min(1),
});
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

export const assistantResponseSchema = z.strictObject({
  response: z.string(),
});
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
