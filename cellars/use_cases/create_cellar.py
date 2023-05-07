import logging

from users.models import User

from ..models import Cellar

logger = logging.getLogger(__name__)


class CreateCellar:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        cellar = Cellar(
            name=data["name"],
            layout=data["layout"],
            has_basket=data["has_basket"],
            user=user,
        )

        cellar.save()

        return cellar
