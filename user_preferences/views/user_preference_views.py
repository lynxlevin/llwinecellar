import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..models import UserPreference
from ..serializers import UserPreferenceSerializer
from ..use_cases import ListUserPreference

logger = logging.getLogger(__name__)


class UserPreferenceViewSet(viewsets.GenericViewSet):
    queryset = UserPreference.objects.all()
    serializer_class = UserPreferenceSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListUserPreference(), format=None):
        try:
            user_preference = use_case.execute(request.user)
            serializer = self.get_serializer({"user_preference": user_preference})
            return Response(serializer.data)
        except Exception as exc:
            return exception_handler_with_logging(exc)
