from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory, APITestCase

from ..entities import AssistantModel, AssistantTemperature
from ..views import ChatView


class ChatViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("chat", kwargs={"model": AssistantModel.FULL.value})
        self.valid_payload = {
            "prompt": "What is the capital of France?",
        }

    @patch("api.views.get_azure_openai_response")
    def test_post_chat_view_success(self, mock_get_azure_openai_response):
        mock_get_azure_openai_response.return_value = "The capital of France is Paris."

        response = self.client.post(
            f"{self.url}?temperature=BALANCED", self.valid_payload, format="json"
        )

        # Assert that the mock was called with expected parameters
        mock_get_azure_openai_response.assert_called_once_with(
            prompt="What is the capital of France?",
            model=AssistantModel.FULL,
            temperature=AssistantTemperature.BALANCED,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["response"], "The capital of France is Paris.")

    def test_post_chat_view_invalid_payload(self):
        invalid_payload: dict[str, str] = {}  # Empty payload

        response = self.client.post(
            f"{self.url}?temperature=BALANCED", invalid_payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("prompt", response.data)


@patch("api.views.get_azure_openai_response")
@pytest.mark.parametrize(
    "model, temperature, expected_status, expected_errors",
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
    mock_get_azure_openai_response, model, temperature, expected_status, expected_errors
):
    mock_get_azure_openai_response.return_value = "Mocked response"

    factory = APIRequestFactory()
    view = ChatView.as_view()

    url = reverse("chat", kwargs={"model": model})
    request = factory.post(
        f"{url}?temperature={temperature}", {"prompt": "Hello"}, format="json"
    )
    response = view(request, model=model)

    assert response.status_code == expected_status
    if expected_errors:
        assert response.data == expected_errors
    else:
        assert "response" in response.data
