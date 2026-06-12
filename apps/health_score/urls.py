from django.urls import path
from apps.health_score.views import HealthScoreView

urlpatterns = [
    path("health-score/", HealthScoreView.as_view(), name="health-score"),
]
