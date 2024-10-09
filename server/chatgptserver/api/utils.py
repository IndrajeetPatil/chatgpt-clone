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
    """
    Generate a response from Azure OpenAI based on the given prompt.

    This function sends a request to Azure OpenAI API and returns the generated response.

    Args:
        prompt (str): The input text prompt to send to the Azure OpenAI model.
        model (AssistantModel, optional): The AI model to use. Defaults to GPT-4o.
        temperature (AssistantTemperature, optional): The sampling temperature to use.
            Defaults to balanced (0.7).

    Returns:
        str: The generated response from the Azure OpenAI model. Returns an empty string if
        the response is None.

    Note:
        - The function uses environment variables for Azure OpenAI configuration.
        - The function logs the time taken for completion and the length of the response.
    """
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
