from typing import TYPE_CHECKING

import pytest
from fastapi.testclient import TestClient

from app.entities import AssistantModel, AssistantTemperature, OpenAIMessageRole
from app.main import UIMessage, app

if TYPE_CHECKING:  # pragma: no cover
    from collections.abc import Iterator


def test_post_chat_stream_success(monkeypatch: pytest.MonkeyPatch) -> None:
    calls = []

    def mock_stream(**kwargs: object) -> Iterator[str]:
        calls.append(kwargs)
        yield "Hello"
        yield " world"

    monkeypatch.setattr("app.main.stream_azure_openai_response", mock_stream)

    client = TestClient(app)
    response = client.post(
        "/api/v1/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Hi"}],
                },
            ],
            "model": "gpt-4o-mini",
            "temperature": "BALANCED",
        },
    )

    assert response.status_code == 200
    assert response.text == "Hello world"
    assert response.headers["content-type"].startswith("text/plain")
    assert calls == [
        {
            "messages": [{"role": "user", "content": "Hi"}],
            "model": AssistantModel.MINI,
            "temperature": AssistantTemperature.BALANCED,
        },
    ]


def test_post_chat_rejects_empty_messages() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/chat",
        json={
            "messages": [{"role": "user", "parts": [{"type": "text", "text": "  "}]}],
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "At least one text message is required."}


@pytest.mark.parametrize(
    ("model", "temperature"),
    [
        ("invalid_model", "BALANCED"),
        ("gpt-4o", "HOT"),
        ("invalid_model", "HOT"),
    ],
)
def test_post_chat_rejects_invalid_model_or_temperature(
    model: str,
    temperature: str,
) -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/chat",
        json={
            "messages": [{"role": "user", "parts": [{"type": "text", "text": "Hi"}]}],
            "model": model,
            "temperature": temperature,
        },
    )

    assert response.status_code == 422


def test_health() -> None:
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ui_message_text_returns_content_field() -> None:
    message = UIMessage(role=OpenAIMessageRole.USER, content="Hello from content")
    assert message.text == "Hello from content"


def test_stream_chat_reraises_exception(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def mock_stream(**kwargs: object) -> None:
        msg = "Upstream failure"
        raise RuntimeError(msg)

    monkeypatch.setattr("app.main.stream_azure_openai_response", mock_stream)

    client = TestClient(app, raise_server_exceptions=True)
    with pytest.raises(RuntimeError, match="Upstream failure"):
        client.post(
            "/api/v1/chat",
            json={
                "messages": [
                    {"role": "user", "parts": [{"type": "text", "text": "Hi"}]},
                ],
            },
        )
