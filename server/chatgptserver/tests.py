from unittest.mock import patch

import pytest
from api.entities import AssistantModel, AssistantTemperature
from api.views import ChatView
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory, APITestCase


class ChatViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = ""
        self.valid_payload = {
            "prompt": "What is the capital of France?",
            "model": AssistantModel.FULL.value,
            "temperature": str(AssistantTemperature.BALANCED.value),
        }

    @patch("api.views.get_azure_openai_response")
    def test_post_chat_view_success(self, mock_get_azure_openai_response):
        mock_get_azure_openai_response.return_value = "The capital of France is Paris."

        response = self.client.post(self.url, self.valid_payload, format="json")

        # Assert that the mock was called with expected parameters
        mock_get_azure_openai_response.assert_called_once_with(
            prompt="What is the capital of France?",
            model=AssistantModel.FULL,
            temperature=AssistantTemperature.BALANCED,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["response"], "The capital of France is Paris.")

    def test_post_chat_view_invalid_payload(self):
        invalid_payload = {
            "prompt": None,
        }

        response = self.client.post(self.url, invalid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("prompt", response.data)


@patch("api.views.get_azure_openai_response")
@pytest.mark.parametrize(
    "request_data, expected_errors",
    [
        # Case: Invalid 'model' value
        (
            {"prompt": "Hello", "model": "InvalidModel", "temperature": "0.7"},
            {"model": ['"InvalidModel" is not a valid choice.']},
        ),
        # Case: Invalid 'temperature' value
        (
            {
                "prompt": "Hello",
                "model": AssistantModel.FULL.value,
                "temperature": "invalid",
            },
            {"temperature": ['"invalid" is not a valid choice.']},
        ),
        # Case: Both 'model' and 'temperature' invalid
        (
            {"prompt": "Hello", "model": "InvalidModel", "temperature": "invalid"},
            {
                "model": ['"InvalidModel" is not a valid choice.'],
                "temperature": ['"invalid" is not a valid choice.'],
            },
        ),
    ],
)
def test_chat_view_invalid_serializer(
    mock_get_azure_openai_response, request_data, expected_errors
):
    # Setup request factory and ChatView instance
    factory = APIRequestFactory()
    view = ChatView.as_view()

    mock_get_azure_openai_response.return_value = "Mocked response"

    request = factory.post("/chat/", data=request_data, format="json")
    response = view(request)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data == expected_errors
