from typing import TYPE_CHECKING

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .azure_client import get_azure_openai_response
from .entities import AssistantModel, AssistantTemperature
from .logging_config import logger
from .serializers import AssistantResponseSerializer, ChatRequestSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request


class ChatView(APIView):
    """API view for generating chat responses via Azure OpenAI."""

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="temperature",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                default=AssistantTemperature.BALANCED.name,
                description=(
                    "Temperature for response generation: "
                    "0.2 (deterministic), 0.7 (balanced), 0.9 (creative)"
                ),
                enum=[temp.name for temp in AssistantTemperature],
            ),
            OpenApiParameter(
                name="model",
                type=str,
                location=OpenApiParameter.PATH,
                required=True,
                description="Model to use for response generation",
                enum=[model.value for model in AssistantModel],
            ),
        ],
        request=ChatRequestSerializer,
        responses={200: AssistantResponseSerializer},
        description="Generate a chat response based on the provided prompt.",
    )
    def post(self, request: Request, model: str | AssistantModel) -> Response:  # noqa: PLR6301
        """
        Generate a chat response for the given model and prompt.

        Returns:
            A DRF Response containing the assistant's reply or an error.

        """
        # Validate model
        try:
            model = AssistantModel(model)
        except ValueError:
            valid_models = ", ".join(AssistantModel)
            error_message = f"Invalid model. Choose from {valid_models}"

            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate and parse temperature
        temperature_str = request.query_params.get(
            "temperature",
            AssistantTemperature.BALANCED.name,
        )
        try:
            temperature: AssistantTemperature = AssistantTemperature[
                temperature_str.upper()
            ]
        except KeyError:
            valid_temperatures = ", ".join(temp.name for temp in AssistantTemperature)
            error_message = f"Invalid temperature. Choose from {valid_temperatures}"
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate prompt
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            logger.info(f"Invalid request: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt: str = serializer.validated_data["prompt"]

        logger.info(
            "Received chat request with:"
            f"\n prompt: {prompt},"
            f"\n model: {model.value},"
            f"\n temperature: {temperature.value}",
        )

        try:
            response: str = get_azure_openai_response(
                prompt=prompt,
                model=model,
                temperature=temperature,
            )
        except Exception as e:  # noqa: BLE001
            logger.exception(f"Error generating response: {e!s}")
            return Response(
                {"error": "Failed to generate response"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.info(f"Generated response length: {len(response)}")
        response_serializer = AssistantResponseSerializer(data={"response": response})
        if response_serializer.is_valid():
            return Response(response_serializer.data)
        return Response(
            response_serializer.errors,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
