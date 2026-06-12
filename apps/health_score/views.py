from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.health_score.services import get_active_dataset_health

class HealthScoreView(APIView):
    """
    Endpoint: GET /api/health-score/
    Computes and returns the multi-dimensional dataset health metrics.
    """
    def get(self, request, *args, **kwargs):
        try:
            health_data = get_active_dataset_health(request.session)
            # Duplicate the top-level keys for frontend compat:
            # st.session_state.health_data = api_client.get_health_score(df)
            # which does: if data and "score" in data: return data
            response_dict = {
                "success": True,
                "message": "Operation completed",
                "score": health_data.get("score"),
                "dimensions": health_data.get("dimensions"),
                "warnings": health_data.get("warnings"),
                "recommendations": health_data.get("recommendations"),
                "data": health_data
            }
            return Response(response_dict, status=status.HTTP_200_OK)
        except FileNotFoundError as fnf:
            return Response({
                "success": False,
                "message": str(fnf),
                "error": {"detail": str(fnf)}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Health score calculation failed: {str(e)}",
                "error": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
