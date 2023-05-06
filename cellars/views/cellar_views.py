import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Cellar
from ..use_cases import ListCellars
from ..serializers import CellarsSerializer
from llwinecellar.exception_handler import exception_handler_with_logging

logger = logging.getLogger(__name__)


class CellarViewSet(viewsets.GenericViewSet):
    queryset = Cellar.objects.all()  # MYMEMO: is this necessary?
    serializer_class = CellarsSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListCellars(), format=None):
        try:
            cellars = use_case.execute(request.user)
            serializer = self.get_serializer({"cellars": cellars})
            return Response(serializer.data)
        except Exception as exc:
            return exception_handler_with_logging(exc)
