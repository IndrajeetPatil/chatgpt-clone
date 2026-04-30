from typing import TYPE_CHECKING, Any

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.entities import AssistantModel, AssistantTemperature

if TYPE_CHECKING:
    from _pytest.monkeypatch import MonkeyPatch

MOCK_PROMPT: str = "What is the capital of India?"
MOCK_RESPONSE: str = "The capital of India is New Delhi."


class MockAzureResponse:
    def __init__(self) -> None:
        self.calls = []
        self.response = MOCK_RESPONSE

    def __call__(self, **kwargs: object) -> str:
        self.calls.append(kwargs)
        return self.response


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def chat_url() -> str:
    return reverse("chat", kwargs={"model": AssistantModel.FULL.value})


@pytest.fixture
def valid_payload() -> dict[str, str]:
    return {"prompt": MOCK_PROMPT}


@pytest.fixture
def mock_azure_response(monkeypatch: MonkeyPatch) -> MockAzureResponse:
    # Not using autouse=True: not all tests require this mock, and some need
    # different configurations.
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
                "error": "Invalid temperature. Choose from DETERMINISTIC, BALANCED, CREATIVE"
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
