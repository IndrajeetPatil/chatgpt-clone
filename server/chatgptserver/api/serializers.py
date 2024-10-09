from rest_framework import serializers

from .entities import AssistantModel, AssistantTemperature


class ChatRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        required=False,
        default="What is the meaning of life?",
        help_text="The message to send to the chat model.",
    )
    model = serializers.ChoiceField(
        choices=[(model.value, model.name) for model in AssistantModel],
        default=AssistantModel.FULL.value,
        help_text="The assistant GPT-4 model to use for generating the response.",
    )
    temperature = serializers.ChoiceField(
        choices=[(str(temp.value), temp.name) for temp in AssistantTemperature],
        default=str(AssistantTemperature.BALANCED.value),
        help_text="The model temperature setting for response generation.",
    )


class AssistantResponseSerializer(serializers.Serializer):
    response = serializers.CharField(
        help_text="The generated response from the chat model."
    )
