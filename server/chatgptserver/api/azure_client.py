# pylint: disable=too-few-public-methods
import logging
import time

from django.conf import settings
from openai import AzureOpenAI

from .entities import AssistantModel, AssistantTemperature

logger = logging.getLogger("django")


class AzureOpenAIClient:
    """
    A singleton client for Azure OpenAI, ensuring thread-safe and efficient usage across multiple requests.

    Note:

    The default timeout for Azure OpenAI is 10 minutes, which is sufficient for most use cases.
    For other constants set by openai-python client (retry delay, max no. of connections, etc.), see:
    https://github.com/openai/openai-python/blob/main/src/openai/_constants.py
    """

    _instance = None

    @classmethod
    def get_instance(cls):
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
        logger.info(
            "Azure OpenAI completion took %s seconds",
            time.time() - start_time,
        )

        client_response_content = _get_safe_response_content(completion)
        logger.info("Length of Azure OpenAI response: %s", len(client_response_content))
        return client_response_content

    except Exception as e:
        logger.error("Error getting Azure OpenAI response: %s", str(e))
        raise


def _get_safe_response_content(completion) -> str:
    try:
        return completion.choices[0].message.content or ""
    except (AttributeError, IndexError):
        logger.error("Unexpected response format from Azure OpenAI")
        return ""
