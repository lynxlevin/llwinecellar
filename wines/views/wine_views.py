import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..models import Wine
from ..serializers import ListWineQuerySerializer, WineSerializer, WinesSerializer
from ..use_cases import CreateWine, ListWine, UpdateWine

logger = logging.getLogger(__name__)


class WineViewSet(viewsets.GenericViewSet):
    queryset = Wine.objects.all()
    serializer_class = WineSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    # MYMEMO: add a function to place wine

    def list(self, request, use_case=ListWine(), format=None):
        try:
            serializer = ListWineQuerySerializer(data=request.GET.dict())
            serializer.is_valid(raise_exception=True)

            queries = serializer.validated_data
            wines = use_case.execute(user=request.user, queries=queries)

            serializer = WinesSerializer({"wines": wines})
            return Response(serializer.data)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def create(self, request, use_case=CreateWine(), format=None):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            wine = use_case.execute(user=request.user, data=data)

            serializer = self.get_serializer(wine)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def update(self, request, use_case=UpdateWine(), format=None, pk=None):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            wine = use_case.execute(user=request.user, wine_id=pk, data=data)

            serializer = self.get_serializer(wine)
            return Response(serializer.data)

        except Exception as exc:
            return exception_handler_with_logging(exc)
