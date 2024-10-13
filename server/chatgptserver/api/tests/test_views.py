from collections.abc import Generator
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from api.entities import AssistantModel, AssistantTemperature
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

MOCK_PROMPT: str = "What is the capital of India?"
MOCK_RESPONSE: str = "The capital of India is New Delhi."


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
def mock_azure_response() -> Generator[MagicMock, None, None]:
    with patch("api.views.get_azure_openai_response") as mock:
        mock.return_value = MOCK_RESPONSE
        yield mock


@pytest.mark.django_db
class TestChatView:
    def test_post_chat_view_success(
        self,
        api_client: APIClient,
        chat_url: str,
        valid_payload: dict[str, str],
        mock_azure_response: MagicMock,
    ) -> None:
        response = api_client.post(
            f"{chat_url}?temperature=BALANCED",
            valid_payload,
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["response"] == MOCK_RESPONSE
        mock_azure_response.assert_called_once_with(
            prompt=MOCK_PROMPT,
            model=AssistantModel.FULL,
            temperature=AssistantTemperature.BALANCED,
        )

    def test_post_chat_view_empty_payload(
        self,
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
    mock_azure_response: MagicMock,
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
