from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .entities import AssistantModel, AssistantTemperature
from .serializers import AssistantResponseSerializer, ChatRequestSerializer
from .utils import get_azure_openai_response


class ChatView(APIView):
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if serializer.is_valid():
            prompt: str = serializer.validated_data["prompt"]
            model: AssistantModel = AssistantModel(serializer.validated_data["model"])
            temperature: AssistantTemperature = AssistantTemperature(
                float(serializer.validated_data["temperature"])
            )
            response: str = get_azure_openai_response(
                prompt=prompt, model=model, temperature=temperature
            )
            response_serializer = AssistantResponseSerializer(
                data={"response": response}
            )
            if response_serializer.is_valid():
                return Response(response_serializer.data)
            else:
                return Response(
                    response_serializer.errors,
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
