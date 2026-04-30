from typing import TYPE_CHECKING, Annotated, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from loguru import logger
from pydantic import BaseModel, Field

from app.azure_client import ChatMessage, stream_azure_openai_response
from app.config import get_settings
from app.entities import AssistantModel, AssistantTemperature, OpenAIMessageRole

if TYPE_CHECKING:
    from collections.abc import Iterator

settings = get_settings()

app = FastAPI(
    title="chatgpt-clone backend",
    description="Streaming backend API for the ChatGPT clone.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextPart(BaseModel):
    type: Literal["text"]
    text: str


class UIMessage(BaseModel):
    role: OpenAIMessageRole
    content: str | None = None
    parts: list[TextPart] = Field(default_factory=list)

    @property
    def text(self) -> str:
        if self.content is not None:
            return self.content
        return "".join(part.text for part in self.parts)


class ChatRequest(BaseModel):
    messages: Annotated[list[UIMessage], Field(min_length=1)]
    model: AssistantModel = AssistantModel.FULL
    temperature: AssistantTemperature = AssistantTemperature.BALANCED


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/api/v1/chat",
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"text/plain": {}},
            "description": "Plain-text assistant response stream.",
        },
    },
)
def chat(request: ChatRequest) -> StreamingResponse:
    messages = _to_openai_messages(request.messages)
    logger.info(
        "Received chat stream request with {} messages, model={}, temperature={}",
        len(messages),
        request.model.value,
        request.temperature.name,
    )

    return StreamingResponse(
        _stream_chat(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
        ),
        media_type="text/plain; charset=utf-8",
    )


def _to_openai_messages(messages: list[UIMessage]) -> list[ChatMessage]:
    openai_messages = [
        {"role": message.role.value, "content": message.text}
        for message in messages
        if message.text.strip()
    ]

    if not openai_messages:
        raise HTTPException(
            status_code=400,
            detail="At least one text message is required.",
        )

    return openai_messages


def _stream_chat(
    *,
    messages: list[ChatMessage],
    model: AssistantModel,
    temperature: AssistantTemperature,
) -> Iterator[str]:
    try:
        yield from stream_azure_openai_response(
            messages=messages,
            model=model,
            temperature=temperature,
        )
    except Exception:
        logger.exception("Error while streaming Azure OpenAI response")
        raise
