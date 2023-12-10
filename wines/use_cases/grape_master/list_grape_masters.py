import logging

from users.models import User

logger = logging.getLogger(__name__)


class ListGrapeMasters:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User):
        logger.info(self.__class__.__name__, extra={"user": user})

        return [{}]