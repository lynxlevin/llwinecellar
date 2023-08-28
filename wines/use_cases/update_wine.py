import logging

from rest_framework import exceptions

from users.models import User

from ..models import Cepage, GrapeMaster, Wine, WineTag

logger = logging.getLogger(__name__)


class UpdateWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, wine_id: str, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})

        wine = Wine.objects.get_by_id(wine_id)

        if wine.user != user:
            raise exceptions.NotFound

        wine.name = data["name"]
        wine.producer = data["producer"]
        wine.country = data["country"]
        wine.region_1 = data["region_1"]
        wine.region_2 = data["region_2"]
        wine.region_3 = data["region_3"]
        wine.region_4 = data["region_4"]
        wine.region_5 = data["region_5"]
        wine.vintage = data["vintage"]
        wine.bought_at = data["bought_at"]
        wine.bought_from = data["bought_from"]
        wine.price_with_tax = data["price_with_tax"]
        wine.drunk_at = data["drunk_at"]
        wine.note = data["note"]

        wine.save()
        if len(data["cepages"]) > 0:
            wine.cepages.set(list())
            cepages = []
            for cepage in data["cepages"]:
                grape_master = GrapeMaster.objects.get_or_create(
                    user_id=user.id, name=cepage["name"], abbreviation=cepage["abbreviation"]
                )[0]
                cepages.append(Cepage(wine_id=wine.id, grape_id=grape_master.id, percentage=cepage["percentage"]))
            Cepage.objects.bulk_create(cepages)
        if len(tag_texts := data["tag_texts"]) > 0:
            tags = [WineTag.objects.get_or_create(user_id=user.id, text=text)[0] for text in tag_texts]
            wine.tags.set(tags)

        wine = Wine.objects.prefetch_tags().get_by_id(wine.id)

        return wine
