import time

from django.conf import settings
from openai import AzureOpenAI
from openai.types.chat import ChatCompletion

from .entities import AssistantModel, AssistantTemperature
from .logging_config import logger


class AzureOpenAIClient:
    """
    A singleton client for Azure OpenAI.

    This ensures thread-safe and efficient usage across multiple requests.

    Note:
    The default timeout for Azure OpenAI is 10 minutes, which is sufficient
    for most use cases. For other constants set by openai-python client
    (retry delay, max no. of connections, etc.), see:
    https://github.com/openai/openai-python/blob/main/src/openai/_constants.py

    """

    _instance = None

    @classmethod
    def get_instance(cls) -> AzureOpenAI:
        """
        Return the singleton AzureOpenAI client, creating it if needed.

        Returns:
            The shared AzureOpenAI client instance.

        """
        if cls._instance is None:
            cls._instance = AzureOpenAI(
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_version=settings.AZURE_OPENAI_API_VERSION,
                api_key=settings.AZURE_OPENAI_API_KEY,
                max_retries=5,  # openai defaults to 2
            )
        return cls._instance


def get_azure_openai_response(
    prompt: str,
    model: AssistantModel = AssistantModel.FULL,
    temperature: AssistantTemperature = AssistantTemperature.BALANCED,
) -> str:
    """
    Send a prompt to Azure OpenAI and return the response text.

    Returns:
        The text content of the model's response.

    """
    client = AzureOpenAIClient.get_instance()
    client.azure_deployment = model.value

    try:
        start_time = time.time()
        completion = client.chat.completions.create(
            model=model.value,
            temperature=temperature.value,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
        logger.info(f"Azure OpenAI completion took {time.time() - start_time} seconds")
        client_response_content = _get_safe_response_content(completion)
        logger.info(f"Length of Azure OpenAI response: {len(client_response_content)}")
    except Exception as e:
        logger.exception(f"Error getting Azure OpenAI response: {e!s}")
        raise
    else:
        return client_response_content


def _get_safe_response_content(completion: ChatCompletion) -> str:
    try:
        return completion.choices[0].message.content or ""
    except (AttributeError, IndexError):
        logger.exception("Unexpected response format from Azure OpenAI")
        return ""
