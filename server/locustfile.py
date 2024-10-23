import json
from random import choice
from typing import Any

from locust import HttpUser, between, task
from rest_framework import status


class ChatAPIUser(HttpUser):
    # Wait between 1 to 5 seconds between tasks
    wait_time = between(1, 5)

    def __init__(self, *args: Any, **kwargs: dict[str, Any]) -> None:
        super().__init__(*args, **kwargs)
        self.models = ["gpt-4o", "gpt-4o-mini"]
        self.temperatures = ["DETERMINISTIC", "BALANCED", "CREATIVE"]
        self.headers = {"Content-Type": "application/json"}

        # Sample prompts for testing
        self.test_prompts = [
            "Tell me about artificial intelligence",
            "What is machine learning?",
            "Explain neural networks",
            "How does deep learning work?",
            "What is natural language processing?",
        ]

    @task(1)
    def chat_request(self) -> None:
        # Randomly select model, temperature and prompt
        model = choice(self.models)
        temperature = choice(self.temperatures)
        prompt = choice(self.test_prompts)
        payload = {"prompt": prompt}

        with self.client.post(
            f"api/v1/chat/{model}/",
            params={"temperature": temperature},
            data=json.dumps(payload),
            headers=self.headers,
            catch_response=True,
        ) as response:
            if response.status_code == status.HTTP_200_OK:
                response.success()  # type: ignore
            else:
                response.failure(  # type: ignore
                    f"Request failed with status code: {response.status_code}",
                )
