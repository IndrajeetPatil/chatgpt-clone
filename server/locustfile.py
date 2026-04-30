import json
from random import choice

from locust import HttpUser, between, task
from rest_framework import status


class ChatAPIUser(HttpUser):
    """Locust user that simulates chat API requests for load testing."""

    # Wait between 1 to 5 seconds between tasks
    wait_time = between(1, 5)

    def __init__(self, *args: object, **kwargs: object) -> None:
        """Initialize the user with test data."""
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
        """Send a randomised chat request to the API."""
        # Randomly select model, temperature and prompt
        model = choice(self.models)  # noqa: S311
        temperature = choice(self.temperatures)  # noqa: S311
        prompt = choice(self.test_prompts)  # noqa: S311
        payload = {"prompt": prompt}

        with self.client.post(
            f"api/v1/chat/{model}/",
            params={"temperature": temperature},
            data=json.dumps(payload),
            headers=self.headers,
            catch_response=True,
        ) as response:
            if response.status_code == status.HTTP_200_OK:
                response.success()
            else:
                response.failure(
                    f"Request failed with status code: {response.status_code}",
                )
