from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.ai_chat.services import process_chat_query

class ChatQueryView(APIView):
    """
    Endpoint: POST /api/chat/
    Accepts JSON body: {"message": "user prompt"}
    Runs NLP query in E2B sandbox or local SQL fallback, and returns standard JSON.
    """
    def post(self, request, *args, **kwargs):
        message = request.data.get("message")
        if not message:
            return Response({
                "success": False,
                "message": "Message is required.",
                "error": {"detail": "Field 'message' is missing."}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            response_text = process_chat_query(message, request.session)
            return Response({
                "success": True,
                "message": "Operation completed",
                "response": response_text,
                "data": {
                    "response": response_text
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Chat query processing failed: {str(e)}",
                "error": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
