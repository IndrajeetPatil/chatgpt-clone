from typing import Optional
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from openai import AzureOpenAI


@csrf_exempt  # TODO: use proper CSRF protection in production
def openai_api_view(
    prompt: str,
    temperature: Optional[float] = 0.7,
    deployment_name: Optional[str] = None,
) -> JsonResponse:
    client = AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_KEY,
        api_key=settings.AZURE_OPENAI_API_VERSION,
    )
    print("prompt", prompt)
    completion = client.chat.completions.create(
        model=deployment_name or settings.AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "temperature": temperature,
            },
        ],
    )

    return JsonResponse(completion)
