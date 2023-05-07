import logging

from rest_framework import exceptions

from users.models import User

from ..models import Wine

logger = logging.getLogger(__name__)


class ListWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User):
        logger.info(self.__class__.__name__, extra={"user": user})

        wines = Wine.objects.filter_eq_user_id(user.id).all()

        return wines
