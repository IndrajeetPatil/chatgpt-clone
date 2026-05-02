from typing import Any

import pytest

from app.azure_client import get_azure_openai_client, stream_azure_openai_response
from app.entities import AssistantModel, AssistantTemperature


class MockAzureClient:
    def __init__(self) -> None:
        self.chat = self.MockChat()

    class MockChat:
        def __init__(self) -> None:
            self.completions = self.MockCompletions()

        class MockCompletions:
            def __init__(self) -> None:
                self.create_calls: list[dict[str, Any]] = []
                self.return_value: list[object] = []
                self.side_effect: Exception | None = None

            def create(self, **kwargs: object) -> list[object]:
                self.create_calls.append(kwargs)
                if self.side_effect is not None:
                    raise self.side_effect
                return self.return_value


def create_chunk(content: str | None) -> object:
    delta = type("MockDelta", (), {"content": content})()
    choice = type("MockChoice", (), {"delta": delta})()
    return type("MockChunk", (), {"choices": [choice]})()


@pytest.fixture
def mock_azure_client(monkeypatch: pytest.MonkeyPatch) -> MockAzureClient:
    mock_client = MockAzureClient()
    get_azure_openai_client.cache_clear()
    monkeypatch.setattr("app.azure_client.get_azure_openai_client", lambda: mock_client)
    return mock_client


@pytest.mark.parametrize(
    ("model", "temperature", "expected_model", "expected_temp"),
    [
        (AssistantModel.MINI, AssistantTemperature.CREATIVE, "gpt-4o-mini", 0.9),
        (AssistantModel.FULL, AssistantTemperature.BALANCED, "gpt-4o", 0.7),
        (AssistantModel.FULL, AssistantTemperature.DETERMINISTIC, "gpt-4o", 0.2),
        (AssistantModel.MINI, AssistantTemperature.DETERMINISTIC, "gpt-4o-mini", 0.2),
    ],
)
def test_stream_successful_response(
    mock_azure_client: MockAzureClient,
    model: AssistantModel,
    temperature: AssistantTemperature,
    expected_model: str,
    expected_temp: float,
) -> None:
    mock_azure_client.chat.completions.return_value = [
        create_chunk("Hello"),
        create_chunk(None),
        create_chunk(" world"),
    ]

    response = list(
        stream_azure_openai_response(
            messages=[{"role": "user", "content": "Test prompt"}],
            model=model,
            temperature=temperature,
        ),
    )

    assert response == ["Hello", " world"]
    assert mock_azure_client.chat.completions.create_calls == [
        {
            "model": expected_model,
            "temperature": expected_temp,
            "messages": [{"role": "user", "content": "Test prompt"}],
            "stream": True,
        },
    ]


@pytest.mark.parametrize(
    ("exc_class", "message"),
    [
        (Exception, "API Error"),
        (ValueError, "Bad value"),
        (RuntimeError, "Runtime failure"),
    ],
)
def test_api_exception(
    mock_azure_client: MockAzureClient,
    exc_class: type[Exception],
    message: str,
) -> None:
    mock_azure_client.chat.completions.side_effect = exc_class(message)

    with pytest.raises(exc_class, match=message):
        list(
            stream_azure_openai_response(
                messages=[{"role": "user", "content": "Test prompt"}],
                model=AssistantModel.FULL,
                temperature=AssistantTemperature.BALANCED,
            ),
        )
