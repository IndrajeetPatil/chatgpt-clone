from enum import Enum, StrEnum


class AssistantModel(StrEnum):
    FULL = "gpt-4o"
    MINI = "gpt-4o-mini"


class AssistantTemperature(Enum):
    DETERMINISTIC = 0.2
    BALANCED = 0.7
    CREATIVE = 0.9
