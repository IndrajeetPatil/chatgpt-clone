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


def test_stream_successful_response(mock_azure_client: MockAzureClient) -> None:
    mock_azure_client.chat.completions.return_value = [
        create_chunk("Hello"),
        create_chunk(None),
        create_chunk(" world"),
    ]

    response = list(
        stream_azure_openai_response(
            messages=[{"role": "user", "content": "Test prompt"}],
            model=AssistantModel.MINI,
            temperature=AssistantTemperature.CREATIVE,
        ),
    )

    assert response == ["Hello", " world"]
    assert mock_azure_client.chat.completions.create_calls == [
        {
            "model": "gpt-4o-mini",
            "temperature": 0.9,
            "messages": [{"role": "user", "content": "Test prompt"}],
            "stream": True,
        },
    ]


def test_api_exception(mock_azure_client: MockAzureClient) -> None:
    mock_azure_client.chat.completions.side_effect = Exception("API Error")

    with pytest.raises(Exception, match="API Error"):
        list(
            stream_azure_openai_response(
                messages=[{"role": "user", "content": "Test prompt"}],
                model=AssistantModel.FULL,
                temperature=AssistantTemperature.BALANCED,
            ),
        )
