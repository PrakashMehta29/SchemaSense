from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.uploads.serializers import UploadedDatasetSerializer
from apps.uploads.services import process_and_save_upload
from core.logger import logger

class DatasetUploadView(APIView):
    """
    Endpoint: POST /api/upload/
    Handles CSV/XLSX file uploads, profiles dimensions, and returns standard JSON.
    """
    def post(self, request, *args, **kwargs):
        serializer = UploadedDatasetSerializer(data=request.data)
        if serializer.is_valid():
            try:
                file_obj = serializer.validated_data["file"]
                dataset = process_and_save_upload(file_obj)
                
                # Store active dataset in request session
                request.session["active_dataset_id"] = dataset.id
                request.session["active_dataset_path"] = dataset.file.path
                request.session["active_dataset_name"] = dataset.filename
                
                return Response({
                    "success": True,
                    "message": "Dataset uploaded successfully",
                    "data": {
                        "filename": dataset.filename,
                        "rows": dataset.row_count,
                        "columns": dataset.column_count
                    }
                }, status=status.HTTP_201_CREATED)
            except ValueError as ve:
                return Response({
                    "success": False,
                    "message": str(ve),
                    "error": {"detail": str(ve)}
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error handling upload: {str(e)}")
                return Response({
                    "success": False,
                    "message": "Internal error processing the file upload.",
                    "error": {"detail": str(e)}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Format validation errors cleanly
        error_msg = "Validation failed."
        if serializer.errors:
            # Grab first error details
            error_msg = ", ".join([f"{k}: {v[0]}" for k, v in serializer.errors.items()])
            
        return Response({
            "success": False,
            "message": error_msg,
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
