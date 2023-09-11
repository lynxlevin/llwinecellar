import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from llwinecellar.exception_handler import exception_handler_with_logging

from ..models import WineTag
from ..serializers import WineTagsSerializer
from ..use_cases import ListWineTags

logger = logging.getLogger(__name__)


class WineTagViewSet(viewsets.GenericViewSet):
    queryset = WineTag.objects.all()
    serializer_class = WineTagsSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListWineTags(), format=None):
        try:
            tag_texts = use_case.execute(user=request.user)

            serializer = self.get_serializer({"tag_texts": tag_texts})
            return Response(serializer.data)

        except Exception as exc:
            return exception_handler_with_logging(exc)
