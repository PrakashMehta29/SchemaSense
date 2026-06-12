from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from core.logger import logger
import traceback

def custom_exception_handler(exc, context):
    """
    Standardizes DRF and Django exception responses to match the API contract.
    Returns:
        {
            "success": False,
            "message": "...",
            "error": {...}
        }
    """
    response = exception_handler(exc, context)

    # Log the traceback for debugging
    logger.error(f"API Exception in context: {context.get('request').path if context.get('request') else 'Unknown'}")
    logger.error(traceback.format_exc())

    if response is not None:
        error_details = response.data
        message = "An error occurred while processing the request."

        # Attempt to parse a readable message
        if isinstance(error_details, dict):
            if "detail" in error_details:
                message = str(error_details["detail"])
            elif len(error_details) > 0:
                parts = []
                for k, v in error_details.items():
                    if isinstance(v, list) and len(v) > 0:
                        parts.append(f"{k}: {v[0]}")
                    else:
                        parts.append(f"{k}: {v}")
                message = ", ".join(parts)
        elif isinstance(error_details, list) and len(error_details) > 0:
            message = str(error_details[0])

        response.data = {
            "success": False,
            "message": message,
            "error": error_details
        }
        return response

    # Fallback for unhandled non-DRF errors
    return Response(
        {
            "success": False,
            "message": f"Server Error: {str(exc)}",
            "error": {"detail": "Internal server error. Check logs."}
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
