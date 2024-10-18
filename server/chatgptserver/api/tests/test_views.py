from typing import Any

import pytest
from _pytest.monkeypatch import MonkeyPatch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.entities import AssistantModel, AssistantTemperature

MOCK_PROMPT: str = "What is the capital of India?"
MOCK_RESPONSE: str = "The capital of India is New Delhi."


class MockAzureResponse:
    """Mock class for Azure OpenAI responses"""

    def __init__(self):
        self.calls = []
        self.response = MOCK_RESPONSE

    def __call__(self, **kwargs):
        self.calls.append(kwargs)
        return self.response


@pytest.fixture
def api_client() -> APIClient:
    """Creates and returns an instance of APIClient."""
    return APIClient()


@pytest.fixture
def chat_url() -> str:
    """Returns the URL for the chat endpoint."""
    return reverse("chat", kwargs={"model": AssistantModel.FULL.value})


@pytest.fixture
def valid_payload() -> dict[str, str]:
    """Returns a valid payload for the chat endpoint."""
    return {"prompt": MOCK_PROMPT}


@pytest.fixture
def mock_azure_response(monkeypatch: MonkeyPatch) -> MockAzureResponse:
    """Mocks the Azure OpenAI response for testing purposes using monkeypatch.
    Not using autouse=True because:
    1. Not all tests require this mock
    2. Explicit dependencies are better for readability
    3. Some tests might need different mock configurations
    """
    mock = MockAzureResponse()
    monkeypatch.setattr("api.views.get_azure_openai_response", mock)
    return mock


@pytest.mark.django_db
def test_post_chat_view_success(
    api_client: APIClient,
    chat_url: str,
    valid_payload: dict[str, str],
    mock_azure_response: MockAzureResponse,
) -> None:
    """Test successful POST request to chat view with valid payload."""
    response = api_client.post(
        f"{chat_url}?temperature=BALANCED",
        valid_payload,
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["response"] == MOCK_RESPONSE
    assert len(mock_azure_response.calls) == 1
    assert mock_azure_response.calls[0] == {
        "prompt": MOCK_PROMPT,
        "model": AssistantModel.FULL,
        "temperature": AssistantTemperature.BALANCED,
    }


@pytest.mark.django_db
def test_post_chat_view_empty_payload(
    api_client: APIClient,
    chat_url: str,
) -> None:
    """Test POST request to chat view with empty payload."""
    invalid_payload: dict[str, Any] = {}

    response = api_client.post(
        f"{chat_url}?temperature=BALANCED",
        invalid_payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "prompt" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("model", "temperature", "expected_status", "expected_errors"),
    [
        # Case: Valid inputs
        (
            AssistantModel.FULL.value,
            AssistantTemperature.CREATIVE.name,
            status.HTTP_200_OK,
            None,
        ),
        # Case: Invalid 'model' value
        (
            "InvalidModel",
            AssistantTemperature.CREATIVE.name,
            status.HTTP_400_BAD_REQUEST,
            {"error": "Invalid model. Choose from gpt-4o, gpt-4o-mini"},
        ),
        # Case: Invalid 'temperature' value
        (
            AssistantModel.FULL.value,
            "INVALID",
            status.HTTP_400_BAD_REQUEST,
            {
                "error": "Invalid temperature. Choose from DETERMINISTIC, BALANCED, CREATIVE",
            },
        ),
        # Case: Both 'model' and 'temperature' invalid
        (
            "InvalidModel",
            "INVALID",
            status.HTTP_400_BAD_REQUEST,
            {"error": "Invalid model. Choose from gpt-4o, gpt-4o-mini"},
        ),
    ],
)
def test_chat_view_parameters(
    mock_azure_response: MockAzureResponse,
    api_client: APIClient,
    model: str,
    temperature: str,
    expected_status: int,
    expected_errors: dict[str, str] | None,
) -> None:
    """Test chat view with different combinations of model and temperature parameters."""
    url: str = reverse("chat", kwargs={"model": model})
    response = api_client.post(
        f"{url}?temperature={temperature}",
        {"prompt": "Hello"},
        format="json",
    )

    assert response.status_code == expected_status
    if expected_errors:
        assert response.data == expected_errors
    else:
        assert "response" in response.data
