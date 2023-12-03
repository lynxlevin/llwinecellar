import logging

from django.db import transaction
from rest_framework import exceptions

from cellars.models import CellarSpace
from users.models import User

from ..models import Cepage, GrapeMaster, Wine, WineTag

logger = logging.getLogger(__name__)


class CreateWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    @transaction.atomic
    def execute(self, user: User, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        wine = Wine(
            name=data["name"],
            producer=data["producer"],
            country=data["country"],
            region_1=data["region_1"],
            region_2=data["region_2"],
            region_3=data["region_3"],
            region_4=data["region_4"],
            region_5=data["region_5"],
            vintage=data["vintage"],
            bought_at=data["bought_at"],
            bought_from=data["bought_from"],
            price=data["price"],
            drunk_at=data["drunk_at"],
            note=data["note"],
            user_id=user.id,
        )
        wine.save()
        if len(data["cepages"]) > 0:
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

        wine = Wine.objects.prefetch_cepages().prefetch_tags().get_by_id(wine.id)

        return wine
