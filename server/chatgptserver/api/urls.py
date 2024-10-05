from django.urls import path
from .views import openai_api_view

urlpatterns = [
    path("openai/", openai_api_view),
]
