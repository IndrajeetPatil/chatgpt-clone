from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        required=False,
        default="What is the meaning of life?",
        help_text="The message to send to the chat model.",
    )
    model = serializers.ChoiceField(
        choices=["gpt-4o", "gpt-4o-mini"],
        default="gpt-4o",
        help_text="The model to use for generating the response.",
    )
    temperature = serializers.ChoiceField(
        choices=[0.2, 0.7, 0.9],
        default=0.7,
        help_text="The temperature setting for response generation.",
    )

    def validate_temperature(self, value):
        return float(value)


class ChatResponseSerializer(serializers.Serializer):
    response = serializers.CharField(
        help_text="The generated response from the chat model."
    )
