import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..models import Cellar
from ..serializers import CellarSerializer, CellarsSerializer
from ..use_cases import CreateCellar, ListCellars

logger = logging.getLogger(__name__)


class CellarViewSet(viewsets.GenericViewSet):
    queryset = Cellar.objects.all()  # MYMEMO: is this necessary?
    serializer_class = CellarSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListCellars(), format=None):
        try:
            cellars = use_case.execute(request.user)
            serializer = CellarsSerializer({"cellars": cellars})
            return Response(serializer.data)
        except Exception as exc:
            return exception_handler_with_logging(exc)

    def create(self, request, use_case=CreateCellar(), format=None):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            cellar = use_case.execute(user=request.user, data=data)

            serializer = self.get_serializer(cellar)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            return exception_handler_with_logging(exc)
