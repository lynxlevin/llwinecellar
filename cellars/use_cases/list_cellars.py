import logging

from rest_framework import exceptions
from users.models import User
from ..models import Cellar

logger = logging.getLogger(__name__)


class ListCellars:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User):
        logger.info(self.__class__.__name__, extra={"user": user})

        cellars = Cellar.objects.filter_eq_user_id(user.id).order_by_created_at().all()

        return cellars
