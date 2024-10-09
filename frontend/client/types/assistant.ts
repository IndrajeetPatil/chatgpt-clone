enum AssistantTemperature {
  DETERMINISTIC = "DETERMINISTIC", // 0.2 - More Deterministic
  BALANCED = "BALANCED", // 0.7 - Balanced
  CREATIVE = "CREATIVE", // 0.9 - More Creative
}

enum AssistantModel {
  FULL = "gpt-4o",
  MINI = "gpt-4o-mini",
}

export { AssistantTemperature, AssistantModel };
