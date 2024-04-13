import logging
import uuid

from cellars.enums import CellarSpaceType
from cellars.models import CellarSpace
from users.models import User

from ..models import Wine

logger = logging.getLogger(__name__)


class ListWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

        self.empty_rack = {
            "name": "",
            "producer": "",
            "country": None,
            "region_1": "",
            "region_2": "",
            "region_3": "",
            "region_4": "",
            "region_5": "",
            "cepages": [],
            "vintage": None,
            "bought_at": None,
            "bought_from": "",
            "price": None,
            "drunk_at": None,
            "note": "",
            "tag_texts": [],
        }

    def execute(self, user: User, queries: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        qs = Wine.objects.filter_eq_user_id(user.id).select_cellarspace()

        if cellar_id := queries.get("cellar_id"):
            qs = qs.filter_eq_cellar_id(cellar_id)

        if (is_drunk := queries.get("is_drunk")) is not None:
            qs = qs.filter_is_drunk(is_drunk)

        if (out_of_cellars := queries.get("out_of_cellars")) is not None:
            qs = qs.filter_eq_cellarspace__isnull(out_of_cellars)

        wines = qs.prefetch_tags().prefetch_cepages().order_by("created_at").all()

        if cellar_id and not is_drunk:
            empty_racks = (
                CellarSpace.objects.filter(cellar_id=cellar_id)
                .filter_by_type(CellarSpaceType.RACK)
                .filter_empty()
                .order_by_position()
            )
            return (
                *wines,
                *(
                    {
                        **self.empty_rack,
                        "id": uuid.uuid4(),
                        "cellar_id": cellar_id,
                        "position": f"{rack.row}-{rack.column}",
                    }
                    for rack in empty_racks
                ),
            )
        else:
            return wines
