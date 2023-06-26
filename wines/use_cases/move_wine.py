import logging
from typing import TYPE_CHECKING, Optional

from cellars.enums import CellarSpaceType
from cellars.models import CellarSpace
from users.models import User

from ..models import Wine

if TYPE_CHECKING:
    from uuid import UUID
logger = logging.getLogger(__name__)


class MoveWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, wine_id: str, data: dict):
        """
        Valid cases:
            Case_1: to empty rack => Just move the wine.
                a: from outside to an empty rack
                c: from a rack to an empty rack
                e: from a basket to an empty rack
            Case_2: to filled rack => Change spaces.
                a: from outside to a filled rack
                b: from a rack to a filled rack
                c: from a basket to a filled rack
            Case_3: to basket => Create a basket CellarSpace and move the wine
                a: from outside to a basket
                b: from a rack to a basket
            Case_4 : from basket to basket => Do nothing.
            Case_5: to outside => Just take the wine out.
                a: from a rack to outside
                b: from basket to outside
        """
        logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})
        # MYMEMO: add wine or cellar not user's
        # MYMEMO: if to_space is None: raise 404
        # MYMEMO: delete old basket space if is_from_basket

        wine = Wine.objects.select_cellarspace().get_by_id(wine_id)
        from_space: Optional[CellarSpace] = wine.cellarspace if hasattr(wine, "cellarspace") else None

        is_from_basket = from_space is not None and from_space.type == CellarSpaceType.BASKET
        is_to_basket = data["row"] is None and data["column"] is None and data["cellar_id"] is not None
        is_to_outside = data["row"] is None and data["column"] is None and data["cellar_id"] is None

        if is_from_basket and is_to_basket:
            return []
        elif is_to_basket:
            to_basket = CellarSpace.objects.create_basket(data["cellar_id"])
            self._take_wine_out(from_space)
            self._place_wine(wine.id, to_basket)
            return [self._get_response_dict(wine.id, to_basket)]

        if is_to_outside:
            self._take_wine_out(from_space)
            return [self._get_response_dict(wine.id, space=None)]

        to_space = CellarSpace.objects.get_by_cellar_row_column(**data)
        # To filled rack
        if (other_wine_id := to_space.wine_id) is not None:
            self._take_wine_out(from_space)
            self._place_wine(wine.id, to_space)

            if from_space is not None:
                self._place_wine(other_wine_id, from_space)

            return [
                self._get_response_dict(wine.id, to_space),
                self._get_response_dict(other_wine_id, from_space),
            ]
        # To empty rack
        else:
            self._take_wine_out(from_space)
            self._place_wine(wine.id, to_space)
            return [self._get_response_dict(wine.id, to_space)]

    def _take_wine_out(self, space: Optional[CellarSpace]):
        if space is not None:
            space.wine_id = None
            space.save(update_fields=["wine_id", "updated_at"])

    def _place_wine(self, wine_id: "UUID", to_space: CellarSpace):
        to_space.wine_id = wine_id
        to_space.save(update_fields=["wine_id", "updated_at"])

    def _get_response_dict(self, wine_id, space):
        return {
            "id": wine_id,
            "cellar_id": space.cellar_id if space else None,
            "row": space.row if space else None,
            "column": space.column if space else None,
        }
