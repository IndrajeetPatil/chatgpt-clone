from unittest.mock import patch, MagicMock

from rest_framework import status
from rest_framework.test import APIClient, APITestCase


class ChatViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = ""
        self.valid_payload = {
            "prompt": "What is the capital of France?",
            "model": "gpt-4o",
            "temperature": 0.7,
        }

    @patch("api.views.get_azure_openai_response")
    def test_post_chat_view_success(self, mock_get_azure_openai_response):
        mock_get_azure_openai_response.return_value = "The capital of France is Paris."

        response = self.client.post(self.url, self.valid_payload, format="json")

        # Assert that the mock was called with expected parameters
        mock_get_azure_openai_response.assert_called_once_with(
            prompt="What is the capital of France?", model="gpt-4o", temperature=0.7
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["response"], "The capital of France is Paris.")

    def test_post_chat_view_invalid_payload(self):
        invalid_payload = {
            "prompt": None,
            "model": "gpt-4o",
            "temperature": 0.7,
        }

        response = self.client.post(self.url, invalid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("prompt", response.data)

    @patch("api.views.AssistantResponseSerializer")
    @patch("api.views.get_azure_openai_response")
    def test_post_chat_view_response_serializer_invalid(
        self, mock_get_azure_openai_response, mock_assistant_response_serializer
    ):
        mock_get_azure_openai_response.return_value = "The capital of France is Paris."

        # Create a mock instance for AssistantResponseSerializer with invalid data
        mock_serializer_instance = MagicMock()
        mock_serializer_instance.is_valid.return_value = False
        mock_serializer_instance.errors = {"response": ["Invalid response format."]}

        # When the view calls serializer, it should use the mocked instance
        mock_assistant_response_serializer.return_value = mock_serializer_instance

        response = self.client.post(self.url, self.valid_payload, format="json")
        mock_serializer_instance.is_valid.assert_called_once()

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data, {"response": ["Invalid response format."]})
