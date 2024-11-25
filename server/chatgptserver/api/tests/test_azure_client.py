import pytest
from _pytest.monkeypatch import MonkeyPatch
from django.test import override_settings
from openai import AzureOpenAI

from api.azure_client import AzureOpenAIClient, get_azure_openai_response
from api.entities import AssistantModel, AssistantTemperature


class MockAzureClient:
    def __init__(self):
        self.chat = self.MockChat()

    class MockChat:
        def __init__(self):
            self.completions = self.MockCompletions()

        class MockCompletions:
            def __init__(self):
                self.create_calls = []
                self.return_value = None
                self.side_effect = None

            def create(self, **kwargs):
                self.create_calls.append(kwargs)
                if self.side_effect is not None:
                    raise self.side_effect
                return self.return_value


@pytest.fixture
def mock_azure_client(monkeypatch: MonkeyPatch) -> MockAzureClient:
    """Fixture that provides a mock AzureOpenAIClient instance using monkeypatch."""
    mock_client = MockAzureClient()

    def mock_get_instance():
        return mock_client

    monkeypatch.setattr(AzureOpenAIClient, "get_instance", mock_get_instance)
    return mock_client


def create_mock_completion(content: str) -> object:
    """Helper function to create mock completion objects."""
    MockMessage = type("MockMessage", (), {"content": content})
    MockChoice = type("MockChoice", (), {"message": MockMessage()})
    return type("MockCompletion", (), {"choices": [MockChoice()]})()


@pytest.mark.django_db
@override_settings(
    AZURE_OPENAI_ENDPOINT="https://test-endpoint.openai.azure.com/",
    AZURE_OPENAI_API_VERSION="2023-05-15",
    AZURE_OPENAI_API_KEY="test-api-key",
)
def test_singleton_instance() -> None:
    """Test that AzureOpenAIClient maintains singleton pattern and proper configuration."""
    instance1 = AzureOpenAIClient.get_instance()
    instance2 = AzureOpenAIClient.get_instance()

    assert instance1 is instance2
    assert isinstance(instance1, AzureOpenAI)
    assert instance1.api_key == "test-api-key"
    assert instance1.max_retries == 5


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("api_response", "expected_output"),
    [
        ("Valid content", "Valid content"),
        ("", ""),
        (None, ""),
    ],
)
def test_successful_response(
    mock_azure_client: MockAzureClient,
    api_response: str,
    expected_output: str,
) -> None:
    """Test successful API responses with different content values."""
    mock_azure_client.chat.completions.return_value = create_mock_completion(
        api_response,
    )

    response = get_azure_openai_response("Test prompt")

    assert response == expected_output
    assert len(mock_azure_client.chat.completions.create_calls) == 1
    assert mock_azure_client.chat.completions.create_calls[0] == {
        "model": AssistantModel.FULL.value,
        "temperature": AssistantTemperature.BALANCED.value,
        "messages": [{"role": "user", "content": "Test prompt"}],
    }


@pytest.mark.django_db
def test_api_exception(mock_azure_client: MockAzureClient) -> None:
    """Test handling of API exceptions."""
    mock_azure_client.chat.completions.side_effect = Exception("API Error")

    with pytest.raises(Exception):
        get_azure_openai_response("Test prompt")


@pytest.mark.django_db
def test_unexpected_response_format(mock_azure_client: MockAzureClient) -> None:
    """Test handling of unexpected response format."""
    mock_completion = type("MockCompletion", (), {"choices": []})()
    mock_azure_client.chat.completions.return_value = mock_completion

    response = get_azure_openai_response("Test prompt")

    assert response == ""


@pytest.mark.django_db
@pytest.mark.crosszip_parametrize(
    "model",
    AssistantModel,
    "temperature",
    AssistantTemperature,
)
def test_different_models_and_temperatures(
    mock_azure_client: MockAzureClient,
    model: AssistantModel,
    temperature: AssistantTemperature,
) -> None:
    """Test API calls with different combinations of models and temperatures."""
    mock_azure_client.chat.completions.return_value = create_mock_completion(
        "Test response",
    )

    response = get_azure_openai_response(
        "Test prompt",
        model=model,
        temperature=temperature,
    )

    assert response == "Test response"
    assert len(mock_azure_client.chat.completions.create_calls) == 1
    assert mock_azure_client.chat.completions.create_calls[0] == {
        "model": model.value,
        "temperature": temperature.value,
        "messages": [{"role": "user", "content": "Test prompt"}],
    }
