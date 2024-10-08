from django.conf import settings
from openai import AzureOpenAI
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .entities import AssistantModel, AssistantTemperature
from .serializers import AssistantResponseSerializer, ChatRequestSerializer


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
    return completion.choices[0].message.content or ""
