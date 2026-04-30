from enum import Enum, StrEnum


class AssistantModel(StrEnum):
    """Available Azure OpenAI model deployments."""

    FULL = "gpt-4o"
    MINI = "gpt-4o-mini"


class AssistantTemperature(Enum):
    """Sampling temperature presets controlling response randomness."""

    DETERMINISTIC = 0.2
    BALANCED = 0.7
    CREATIVE = 0.9
