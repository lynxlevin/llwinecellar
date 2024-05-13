import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..serializers import WineMemoRequestSerializer, WineMemoSerializer, WineMemosSerializer
from ..use_cases import CreateWineMemo, ListWineMemo, UpdateWineMemo

logger = logging.getLogger(__name__)


class WineMemoViewSet(viewsets.GenericViewSet):
    serializer_class = WineMemoSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListWineMemo(), format=None):
        try:
            wine_memos = use_case.execute(user=request.user)

            serializer = WineMemosSerializer({"wine_memos": wine_memos})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def create(self, request, use_case=CreateWineMemo(), format=None):
        try:
            serializer = WineMemoRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            wine_memo = use_case.execute(user=request.user, data=data)

            serializer = self.get_serializer(wine_memo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def update(self, request, use_case=UpdateWineMemo(), format=None, pk=None):
        try:
            serializer = WineMemoRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            wine_memo = use_case.execute(user=request.user, id=pk, data=data)

            serializer = self.get_serializer(wine_memo)
            return Response(serializer.data)

        except Exception as exc:
            return exception_handler_with_logging(exc)
