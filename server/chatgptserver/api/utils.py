import logging
import time

from django.conf import settings
from openai import AzureOpenAI

from .entities import AssistantModel, AssistantTemperature

logger = logging.getLogger("django")


def get_azure_openai_response(
    prompt: str,
    model: AssistantModel = AssistantModel.FULL,
    temperature: AssistantTemperature = AssistantTemperature.BALANCED,
) -> str:
    client = AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        api_key=settings.AZURE_OPENAI_API_KEY,
        azure_deployment=model.value,
    )
    # TODO: subsequent calls to this function don't return new responses
    # is cache policy active for this resource?
    # https://learn.microsoft.com/en-us/azure/api-management/azure-openai-semantic-cache-store-policy#policy-statement
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
    client_response_content = completion.choices[0].message.content
    logger.info(
        "Length of Azure OpenAI response: %s", len(str(client_response_content))
    )
    return client_response_content or ""
