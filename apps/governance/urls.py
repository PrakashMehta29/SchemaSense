from django.urls import path
from apps.governance.views import GovernanceReportView

urlpatterns = [
    path("governance-report/", GovernanceReportView.as_view(), name="governance-report"),
]
