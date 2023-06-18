import logging

from users.models import User

from ..models import Wine

logger = logging.getLogger(__name__)


class UpdateWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, wine_id: str, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})

        wine = Wine.objects.get_by_id(wine_id)

        wine.drink_when = data["drink_when"]
        wine.name = data["name"]
        wine.producer = data["producer"]
        wine.country = data["country"]
        wine.region_1 = data["region_1"]
        wine.region_2 = data["region_2"]
        wine.region_3 = data["region_3"]
        wine.region_4 = data["region_4"]
        wine.region_5 = data["region_5"]
        wine.cepage = data["cepage"]
        wine.vintage = data["vintage"]
        wine.bought_at = data["bought_at"]
        wine.bought_from = data["bought_from"]
        wine.price_with_tax = data["price_with_tax"]
        wine.drunk_at = data["drunk_at"]
        wine.note = data["note"]

        wine.save()

        return wine
