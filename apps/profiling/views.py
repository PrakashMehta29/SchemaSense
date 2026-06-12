from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.profiling.services import profile_active_dataset

class ProfileSummaryView(APIView):
    """
    Endpoint: GET /api/profile-summary/
    Retrieves high-speed Polars profiling statistics for the active dataset.
    """
    def get(self, request, *args, **kwargs):
        try:
            metrics = profile_active_dataset(request.session)
            return Response({
                "success": True,
                "message": "Operation completed",
                "data": metrics
            }, status=status.HTTP_200_OK)
        except FileNotFoundError as fnf:
            return Response({
                "success": False,
                "message": str(fnf),
                "error": {"detail": str(fnf)}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Profiling failed: {str(e)}",
                "error": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
