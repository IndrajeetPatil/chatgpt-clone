import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings


@csrf_exempt  # Only for development; use proper CSRF protection in production
def openai_api_view(request) -> JsonResponse:
    prompt = request.GET.get("prompt", "")
    deployment_name = request.GET.get(
        "deployment", settings.AZURE_OPENAI_DEPLOYMENT_NAME
    )
    temperature = request.GET.get("temperature", 0.7)

    endpoint = settings.AZURE_OPENAI_ENDPOINT
    api_key = settings.AZURE_OPENAI_API_KEY
    api_version = settings.AZURE_OPENAI_API_VERSION

    url = f"{endpoint}openai/deployments/{deployment_name}/completions?api-version={api_version}"  # noqa

    headers = {
        "Content-Type": "application/json",
        "api-key": api_key,
    }

    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return JsonResponse(response.json())
    except requests.exceptions.HTTPError as err:
        status_code = response.status_code
        return JsonResponse(
            {"error": str(err), "details": response.text}, status=status_code
        )
