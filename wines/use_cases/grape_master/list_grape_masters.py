import logging

from users.models import User

from ...models import GrapeMaster

logger = logging.getLogger(__name__)


class ListGrapeMasters:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User):
        logger.info(self.__class__.__name__, extra={"user": user})

        grape_masters = GrapeMaster.objects.filter_eq_user_id(user.id).all()

        return grape_masters
