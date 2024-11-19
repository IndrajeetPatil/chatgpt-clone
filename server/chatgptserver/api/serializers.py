from typing import Any

from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer[dict[str, Any]]):
    prompt = serializers.CharField()


class AssistantResponseSerializer(serializers.Serializer[dict[str, Any]]):
    response = serializers.CharField()
