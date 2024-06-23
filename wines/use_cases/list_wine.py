import logging
import uuid
from typing import TYPE_CHECKING, TypedDict

from cellars.enums import CellarSpaceType
from cellars.models import CellarSpace
from users.models import User

from ..models import Wine

if TYPE_CHECKING:
    from uuid import UUID

    class ListWineQuery(TypedDict, total=False):
        cellar_id: "UUID"
        name: str
        producer: str
        name_or_producer: str
        is_drunk: bool
        out_of_cellars: bool
        show_drunk: bool
        show_stock: bool
        country: str
        region_1: str
        region_2: str
        region_3: str
        region_4: str
        region_5: str
        cepage_names: list[str]


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
            "value": None,
        }

    def execute(self, user: User, queries: "ListWineQuery"):
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        qs = Wine.objects.filter_eq_user_id(user.id).select_cellarspace()

        if cellar_id := queries.get("cellar_id"):
            qs = qs.filter_eq_cellar_id(cellar_id)

        if name := queries.get("name"):
            qs = qs.filter_eq_name(name)

        if producer := queries.get("producer"):
            qs = qs.filter_eq_producer(producer)

        if name_or_producer := queries.get("name_or_producer"):
            qs = qs.filter_eq_name_or_producer(name_or_producer)

        if country := queries.get("country"):
            qs = qs.filter_eq_country(country)

        if region_1 := queries.get("region_1"):
            qs = qs.filter(region_1__unaccent=region_1)

        if region_2 := queries.get("region_2"):
            qs = qs.filter(region_2__unaccent=region_2)

        if region_3 := queries.get("region_3"):
            qs = qs.filter(region_3__unaccent=region_3)

        if region_4 := queries.get("region_4"):
            qs = qs.filter(region_4__unaccent=region_4)

        if region_5 := queries.get("region_5"):
            qs = qs.filter(region_5__unaccent=region_5)

        if cepage_names := queries.get("cepage_names"):
            for cepage_name in cepage_names:
                qs = qs.filter(cepages__grape__name=cepage_name)

        if (is_drunk := queries.get("is_drunk")) is not None:
            qs = qs.filter_is_drunk(is_drunk)

        show_drunk = queries.get("show_drunk")
        show_stock = queries.get("show_stock")
        if show_drunk and not show_stock:
            qs = qs.filter_is_drunk(True)
        elif show_stock and not show_drunk:
            qs = qs.filter_is_drunk(False)

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
