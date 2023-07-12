import logging

from users.models import User

from ..models import UserPreference

logger = logging.getLogger(__name__)


class CreateUserPreference:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, params: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "params": params})

        user_preference = UserPreference.objects.create(
            user=user,
            **params,
        )

        return user_preference
