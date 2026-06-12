from django.urls import path
from apps.metadata.views import GenerateMetadataView

urlpatterns = [
    path("generate-metadata/", GenerateMetadataView.as_view(), name="generate-metadata"),
]
