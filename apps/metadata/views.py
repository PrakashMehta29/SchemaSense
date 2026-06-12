from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.metadata.services import generate_dataset_metadata

class GenerateMetadataView(APIView):
    """
    Endpoint: POST /api/generate-metadata/
    Accepts JSON body: {"columns": ["col1", "col2", ...]}
    Generates intelligent descriptions and mappings.
    """
    def post(self, request, *args, **kwargs):
        columns = request.data.get("columns")
        try:
            metadata = generate_dataset_metadata(columns, request.session)
            return Response({
                "success": True,
                "message": "Operation completed",
                "metadata": metadata,  # Standard key expected by frontend
                "data": {
                    "metadata": metadata
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
                "message": f"Failed to generate metadata: {str(e)}",
                "error": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
