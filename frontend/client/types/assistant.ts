export const AssistantModel = {
  FULL: "gpt-4o",
  MINI: "gpt-4o-mini",
} as const;

export type AssistantModel =
  (typeof AssistantModel)[keyof typeof AssistantModel];

export const AssistantTemperature = {
  DETERMINISTIC: "DETERMINISTIC",
  BALANCED: "BALANCED",
  CREATIVE: "CREATIVE",
} as const;

export type AssistantTemperature =
  (typeof AssistantTemperature)[keyof typeof AssistantTemperature];
