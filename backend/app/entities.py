from enum import StrEnum


class AssistantModel(StrEnum):
    FULL = "gpt-4o"
    MINI = "gpt-4o-mini"


class AssistantTemperature(StrEnum):
    DETERMINISTIC = "DETERMINISTIC"
    BALANCED = "BALANCED"
    CREATIVE = "CREATIVE"

    @property
    def openai_value(self) -> float:
        return {
            AssistantTemperature.DETERMINISTIC: 0.2,
            AssistantTemperature.BALANCED: 0.7,
            AssistantTemperature.CREATIVE: 0.9,
        }[self]


class OpenAIMessageRole(StrEnum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
