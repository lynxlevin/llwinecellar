import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..models import Wine
from ..serializers import WineSerializer
from ..use_cases import CreateWine

logger = logging.getLogger(__name__)


class WineViewSet(viewsets.GenericViewSet):
    queryset = Wine.objects.all()  # MYMEMO: is this necessary?
    serializer_class = WineSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

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
