import logging

from users.models import User

from ..models import Cepage, GrapeMaster, Wine, WineTag

logger = logging.getLogger(__name__)


class CreateWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

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
            price_with_tax=data["price_with_tax"],
            drunk_at=data["drunk_at"],
            note=data["note"],
            user_id=user.id,
        )
        wine.save()
        if len(data["cepages"]) > 0:
            cepages = []
            # MYMEMO: resolve N+1
            # MYMEMO: test creation of new GrapeMaster
            for cepage in data["cepages"]:
                grape_master = GrapeMaster.objects.get_or_create(
                    user_id=user.id, name=cepage["name"], abbreviation=cepage["abbreviation"]
                )[0]
                cepages.append(Cepage(wine_id=wine.id, grape_id=grape_master.id, percentage=cepage["percentage"]))
            Cepage.objects.bulk_create(cepages)

        if len(tag_texts := data["tag_texts"]) > 0:
            # MYMEMO: resolve N+1
            # MYMEMO: test creation on new WineTag
            tags = [WineTag.objects.get_or_create(user_id=user.id, text=text)[0] for text in tag_texts]
            wine.tags.set(tags)

        wine = Wine.objects.prefetch_cepages().prefetch_tags().get_by_id(wine.id)

        return wine
