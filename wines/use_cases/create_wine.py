import logging

from users.models import User

from ..models import Wine

logger = logging.getLogger(__name__)


class CreateWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        wine = Wine(
            drink_when=data["drink_when"],
            name=data["name"],
            producer=data["producer"],
            country=data["country"],
            region_1=data["region_1"],
            region_2=data["region_2"],
            region_3=data["region_3"],
            region_4=data["region_4"],
            region_5=data["region_5"],
            cepage=data["cepage"],
            vintage=data["vintage"],
            bought_at=data["bought_at"],
            bought_from=data["bought_from"],
            price_with_tax=data["price_with_tax"],
            drunk_at=data["drunk_at"],
            note=data["note"],
            user_id=user.id,
        )

        wine.save()

        return wine
