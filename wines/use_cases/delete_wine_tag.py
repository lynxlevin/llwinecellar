import logging

from rest_framework import exceptions

from users.models import User

from ..models import WineTag

logger = logging.getLogger(__name__)


class DeleteWineTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, tag_text: str):
        logger.info(self.__class__.__name__, extra={"user": user, "tag_text": tag_text})

        tag_to_delete = WineTag.objects.get_by_text_and_user_id(tag_text, user.id)

        if tag_to_delete is None:
            raise exceptions.NotFound()

        return tag_to_delete.delete()
