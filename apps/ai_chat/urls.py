from django.urls import path
from apps.ai_chat.views import ChatQueryView

urlpatterns = [
    path("chat/", ChatQueryView.as_view(), name="ai-chat"),
]
