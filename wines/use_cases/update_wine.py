import logging

from django.db import transaction
from rest_framework import exceptions

from cellars.models import CellarSpace
from users.models import User

from ..models import Cepage, GrapeMaster, Wine, WineTag

logger = logging.getLogger(__name__)


class UpdateWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    @transaction.atomic
    def execute(self, user: User, wine_id: str, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})

        wine = Wine.objects.filter_eq_user_id(user.id).select_cellarspace().get_by_id(wine_id)

        if wine is None:
            raise exceptions.NotFound()

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
        wine.price = data["price"]
        wine.drunk_at = data["drunk_at"]
        wine.note = data["note"]
        wine.value = data["value"]

        wine.save()
        wine.cepages.all().delete()
        if len(data["cepages"]) > 0:
            cepages = []
            for cepage in data["cepages"]:
                grape_master = GrapeMaster.objects.get_or_create(
                    user_id=user.id, name=cepage["name"], abbreviation=cepage["abbreviation"]
                )[0]
                cepages.append(Cepage(wine_id=wine.id, grape_id=grape_master.id, percentage=cepage["percentage"]))
            Cepage.objects.bulk_create(cepages)
        if len(tag_texts := data["tag_texts"]) > 0:
            # MYMEMO(後日): 順番を保持するように (後から追加は保持できているけど、最初に複数つけた時、フロントで書いた通りの順番にならない)
            tags = [WineTag.objects.get_or_create(user_id=user.id, text=text)[0] for text in tag_texts]
            wine.tags.set(tags)
        else:
            wine.tags.clear()

        if "cellar_id" in data.keys():
            if from_space := wine.cellarspace if hasattr(wine, "cellarspace") else None:
                from_space.wine = None
                from_space.save(update_fields=["wine_id", "updated_at"])
        if (cellar_id := data.get("cellar_id")) and (position := data.get("position")):
            if not user.has_cellar(cellar_id):
                raise exceptions.NotFound(detail={"cellar_id": "This cellar does not exist."})
            if position == "basket":
                to_space = CellarSpace.objects.get_or_create_empty_basket(cellar_id)
            else:
                row, _, column = position.partition("-")
                to_space = CellarSpace.objects.get_by_cellar_row_column(cellar_id, row, column)
            if to_space is None:
                raise exceptions.NotFound(detail={"position": "This position does not exist."})
            if to_space.wine_id is not None:
                raise exceptions.PermissionDenied(detail={"position": "That position is already occupied."})
            to_space.wine = wine
            to_space.save(update_fields=["wine_id", "updated_at"])

        wine = Wine.objects.prefetch_tags().select_cellarspace().get_by_id(wine.id)

        return wine
