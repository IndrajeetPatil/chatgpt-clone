import logging

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .azure_client import get_azure_openai_response
from .entities import AssistantModel, AssistantTemperature
from .serializers import AssistantResponseSerializer, ChatRequestSerializer

logger = logging.getLogger("django")


class ChatView(APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="temperature",
                type=str,
                location=OpenApiParameter.QUERY,
                required=False,
                default=AssistantTemperature.BALANCED.name,
                description="Temperature for response generation: 0.2 (deterministic), 0.7 (balanced), 0.9 (creative)",
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
        description="Generate a chat response based on the provided prompt and settings.",
    )
    def post(self, request, model: str | AssistantModel) -> Response:
        # Validate model
        try:
            model = AssistantModel(model)
        except ValueError:
            valid_models = ", ".join(AssistantModel)
            error_message = f"Invalid model. Choose from {valid_models}"

            return Response(
                {"error": error_message}, status=status.HTTP_400_BAD_REQUEST
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
            return Response(
                {
                    "error": f"Invalid temperature. Choose from {", ".join(temp.name for temp in AssistantTemperature)}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate prompt
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            logger.info("Invalid request: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt: str = serializer.validated_data["prompt"]

        logger.info(
            "Received chat request with:\n prompt: %s,\n model: %s,\n temperature: %s",
            prompt,
            model.value,
            temperature.value,
        )

        try:
            response: str = get_azure_openai_response(
                prompt=prompt,
                model=model,
                temperature=temperature,
            )
        except Exception as e:
            logger.exception("Error generating response: %s", str(e))
            return Response(
                {"error": "Failed to generate response"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.info("Generated response length: %s", len(response))
        response_serializer = AssistantResponseSerializer(data={"response": response})
        if response_serializer.is_valid():
            return Response(response_serializer.data)
        return Response(
            response_serializer.errors,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
