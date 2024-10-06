from typing import Optional

from django.conf import settings
from openai import AzureOpenAI, ChatCompletion
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ChatRequestSerializer, ChatResponseSerializer


class ChatView(APIView):
    def post(self, request):
        print("request", request)
        print("request.data", request.data)
        serializer = ChatRequestSerializer(data=request.data)
        if serializer.is_valid():
            prompt = serializer.validated_data["prompt"]
            model = serializer.validated_data["model"]
            temperature = serializer.validated_data["temperature"]
            response: str = _get_azure_openai_response(
                prompt=prompt, model=model, temperature=temperature
            )
            response_serializer = ChatResponseSerializer(data={"response": response})
            if response_serializer.is_valid():
                return Response(response_serializer.data)
            else:
                return Response(
                    response_serializer.errors,
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _get_azure_openai_response(
    prompt: str,
    model: Optional[str] = "gpt-4o",
    temperature: Optional[float] = 0.7,
) -> str:
    client = AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        api_key=settings.AZURE_OPENAI_API_KEY,
    )
    completion: ChatCompletion = client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )
    return completion.choices[0].message.content
