from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def welcome_view(request):
    return JsonResponse({
        "success": True,
        "message": "Welcome to the SchemaSense Backend API. The server is online and operational.",
        "data": {
            "status": "operational",
            "version": "1.0.0",
            "endpoints": [
                "/api/upload/",
                "/api/profile-summary/",
                "/api/generate-metadata/",
                "/api/health-score/",
                "/api/governance-report/",
                "/api/chat/"
            ]
        }
    })

urlpatterns = [
    path("", welcome_view, name="welcome"),
    path("admin/", admin.site.urls),
    path("api/", include("apps.uploads.urls")),
    path("api/", include("apps.profiling.urls")),
    path("api/", include("apps.metadata.urls")),
    path("api/", include("apps.governance.urls")),
    path("api/", include("apps.health_score.urls")),
    path("api/", include("apps.ai_chat.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
