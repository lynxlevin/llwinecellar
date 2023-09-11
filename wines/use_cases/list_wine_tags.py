import logging

from users.models import User

from ..models import WineTag

logger = logging.getLogger(__name__)


class ListWineTags:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User):
        logger.info(self.__class__.__name__, extra={"user": user})

        return WineTag.objects.filter_eq_user_id(user.id).values_list("text", flat=True)
