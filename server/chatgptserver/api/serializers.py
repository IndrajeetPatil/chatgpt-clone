from typing import Any

from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer[dict[str, Any]]):
    """Serializer for incoming chat prompt requests."""

    prompt = serializers.CharField()


class AssistantResponseSerializer(serializers.Serializer[dict[str, Any]]):
    """Serializer for outgoing assistant response payloads."""

    response = serializers.CharField()
