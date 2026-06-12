from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.governance.services import generate_governance_report

class GovernanceReportView(APIView):
    """
    Endpoint: GET /api/governance-report/
    Analyzes columns for compliance or PII leaks, returning standard compliance report format.
    """
    def get(self, request, *args, **kwargs):
        try:
            risks = generate_governance_report(request.session)
            return Response({
                "success": True,
                "message": "Operation completed",
                "risks": risks,  # Standard key expected by frontend
                "data": {
                    "risks": risks
                }
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
                "message": f"Governance check failed: {str(e)}",
                "error": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
