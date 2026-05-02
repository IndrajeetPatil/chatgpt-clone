import time
from functools import lru_cache
from typing import TYPE_CHECKING, cast

from loguru import logger
from openai import AzureOpenAI

from app.config import get_settings

if TYPE_CHECKING:  # pragma: no cover
    from collections.abc import Iterator, Sequence

    from openai.types.chat import ChatCompletionMessageParam

    from app.entities import AssistantModel, AssistantTemperature

ChatMessage = dict[str, str]


@lru_cache(maxsize=1)
def get_azure_openai_client() -> AzureOpenAI:  # pragma: no cover
    settings = get_settings()
    return AzureOpenAI(
        azure_endpoint=settings.azure_openai_endpoint,
        api_version=settings.azure_openai_api_version,
        api_key=settings.azure_openai_api_key,
        max_retries=5,
    )


def stream_azure_openai_response(
    *,
    messages: Sequence[ChatMessage],
    model: AssistantModel,
    temperature: AssistantTemperature,
) -> Iterator[str]:
    client = get_azure_openai_client()
    start_time = time.time()

    stream = client.chat.completions.create(
        model=model.value,
        temperature=temperature.openai_value,
        messages=cast("Sequence[ChatCompletionMessageParam]", messages),
        stream=True,
    )

    total_length = 0
    for chunk in stream:
        if not chunk.choices:
            continue

        content = chunk.choices[0].delta.content or ""
        if content:
            total_length += len(content)
            yield content

    logger.info(
        "Azure OpenAI streaming completion took {:.2f}s and returned {} characters",
        time.time() - start_time,
        total_length,
    )
