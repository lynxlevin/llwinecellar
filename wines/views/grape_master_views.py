import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..models import GrapeMaster
from ..serializers import GrapeMastersSerializer
from ..use_cases import ListGrapeMasters

logger = logging.getLogger(__name__)


class GrapeMasterViewSet(viewsets.GenericViewSet):
    queryset = GrapeMaster.objects.all()
    serializer_class = GrapeMastersSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListGrapeMasters(), format=None):
        try:
            grape_masters = use_case.execute(user=request.user)

            serializer = self.get_serializer({"grape_masters": grape_masters})
            return Response(serializer.data)

        except Exception as exc:
            return exception_handler_with_logging(exc)
