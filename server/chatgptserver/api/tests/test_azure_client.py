from unittest.mock import MagicMock, patch

import pytest
from django.test import override_settings
from openai import AzureOpenAI

from ..azure_client import AzureOpenAIClient, get_azure_openai_response
from ..entities import AssistantModel, AssistantTemperature


@pytest.fixture
def mock_azure_client():
    with patch("api.AzureOpenAIClient.get_instance") as mock_get_instance:
        mock_client = MagicMock()
        mock_get_instance.return_value = mock_client
        yield mock_client


@pytest.mark.django_db
class TestAzureOpenAIClient:
    @override_settings(
        AZURE_OPENAI_ENDPOINT="https://test-endpoint.openai.azure.com/",
        AZURE_OPENAI_API_VERSION="2023-05-15",
        AZURE_OPENAI_API_KEY="test-api-key",
    )
    def test_singleton_instance(self):
        instance1 = AzureOpenAIClient.get_instance()
        instance2 = AzureOpenAIClient.get_instance()
        assert instance1 is instance2
        assert isinstance(instance1, AzureOpenAI)
        assert instance1.api_key == "test-api-key"
        assert instance1.max_retries == 5


@pytest.mark.django_db
class TestGetAzureOpenAIResponse:
    @pytest.mark.parametrize(
        "api_response, expected_output",
        [
            ("Valid content", "Valid content"),
            ("", ""),
            (None, ""),
        ],
    )
    def test_successful_response(
        self, mock_azure_client, api_response, expected_output
    ):
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = api_response
        mock_azure_client.chat.completions.create.return_value = mock_completion

        response = get_azure_openai_response("Test prompt")

        assert response == expected_output
        mock_azure_client.chat.completions.create.assert_called_once_with(
            model=AssistantModel.FULL.value,
            temperature=AssistantTemperature.BALANCED.value,
            messages=[{"role": "user", "content": "Test prompt"}],
        )

    def test_api_exception(self, mock_azure_client):
        mock_azure_client.chat.completions.create.side_effect = Exception("API Error")

        with pytest.raises(Exception):
            get_azure_openai_response("Test prompt")

    def test_unexpected_response_format(self, mock_azure_client):
        mock_completion = MagicMock()
        mock_completion.choices = []  # Empty choices list
        mock_azure_client.chat.completions.create.return_value = mock_completion

        response = get_azure_openai_response("Test prompt")

        assert response == ""  # Expect empty string for unexpected format

    @pytest.mark.parametrize(
        "model, temperature",
        [
            (AssistantModel.FULL, AssistantTemperature.BALANCED),
            (AssistantModel.MINI, AssistantTemperature.CREATIVE),
        ],
    )
    def test_different_models_and_temperatures(
        self, mock_azure_client, model, temperature
    ):
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "Test response"
        mock_azure_client.chat.completions.create.return_value = mock_completion

        response = get_azure_openai_response(
            "Test prompt", model=model, temperature=temperature
        )

        assert response == "Test response"
        mock_azure_client.chat.completions.create.assert_called_once_with(
            model=model.value,
            temperature=temperature.value,
            messages=[{"role": "user", "content": "Test prompt"}],
        )
