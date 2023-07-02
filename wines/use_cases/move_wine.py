import logging
from typing import TYPE_CHECKING, Optional

from rest_framework import exceptions

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
        logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})

        wine = Wine.objects.filter_eq_user_id(user.id).select_cellarspace().get_by_id(wine_id)
        if not wine:
            raise exceptions.NotFound

        if data["cellar_id"] and not user.has_cellar(data["cellar_id"]):
            raise exceptions.NotFound

        from_space: Optional[CellarSpace] = wine.cellarspace if hasattr(wine, "cellarspace") else None

        is_from_basket = from_space is not None and from_space.type == CellarSpaceType.BASKET
        is_to_basket = data["row"] is None and data["column"] is None and data["cellar_id"] is not None
        is_from_outside = from_space is None
        is_to_outside = data["cellar_id"] is None

        if (is_from_basket and is_to_basket) or (is_from_outside and is_to_outside):
            return []

        if is_to_outside:
            to_space = None
        else:
            to_space = self._get_to_space(data["cellar_id"], data["row"], data["column"])
            if to_space is None:
                raise exceptions.NotFound

        plans = [
            {
                "id": wine.id,
                "cellar_id": data["cellar_id"],
                "row": data["row"],
                "column": data["column"],
                "to_space": to_space,
            }
        ]

        if plans[0]["to_space"] and (other_wine_id := plans[0]["to_space"].wine_id):
            plans.append(
                {
                    "id": other_wine_id,
                    "cellar_id": from_space.cellar_id if from_space else None,
                    "row": from_space.row if from_space else None,
                    "column": from_space.column if from_space else None,
                    "to_space": from_space,
                }
            )

        if from_space:
            self._take_wine_out(from_space)

        for plan in plans:
            if plan["to_space"]:
                self._place_wine(plan["id"], plan["to_space"])

        return plans

    # def execute(self, user: User, wine_id: str, data: dict):
    #     logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})

    #     wine = Wine.objects.filter_eq_user_id(user.id).select_cellarspace().get_by_id(wine_id)
    #     if not wine:
    #         raise exceptions.NotFound

    #     if data["cellar_id"] and not user.has_cellar(data["cellar_id"]):
    #         raise exceptions.NotFound

    #     from_space: Optional[CellarSpace] = wine.cellarspace if hasattr(wine, "cellarspace") else None

    #     is_from_basket = from_space is not None and from_space.type == CellarSpaceType.BASKET
    #     is_to_basket = not any([data["row"], data["column"]]) and data["cellar_id"]
    #     is_from_outside = from_space is None
    #     is_to_outside = data["cellar_id"] is None

    #     moved_wines: list[dict] = []

    #     if (is_from_basket and is_to_basket) or (is_from_outside and is_to_outside):
    #         return moved_wines

    #     if not is_from_outside:
    #         self._take_wine_out(from_space)
    #         if is_to_outside:
    #             moved_wines.append(self._get_response_dict(wine.id, space=None))
    #             return moved_wines

    #     to_space = self._get_to_space(data["cellar_id"], data["row"], data["column"])
    #     if to_space is None:
    #         raise exceptions.NotFound

    #     other_wine_id: Optional["UUID"] = to_space.wine_id

    #     self._place_wine(wine.id, to_space)
    #     moved_wines.append(self._get_response_dict(wine.id, to_space))

    #     if not (_is_to_filled_rack := other_wine_id is not None):
    #         return moved_wines
    #     elif is_from_outside:
    #         moved_wines.append(self._get_response_dict(other_wine_id, space=None))
    #         return moved_wines

    #     self._place_wine(other_wine_id, from_space)
    #     moved_wines.append(self._get_response_dict(other_wine_id, from_space))
    #     return moved_wines

    def _take_wine_out(self, space: Optional[CellarSpace]):
        space.wine_id = None
        space.save(update_fields=["wine_id", "updated_at"])

    def _place_wine(self, wine_id: "UUID", to_space: CellarSpace):
        to_space.wine_id = wine_id
        to_space.save(update_fields=["wine_id", "updated_at"])

    def _get_to_space(self, cellar_id, row, column) -> Optional[CellarSpace]:
        """
        Returns None when the space does not exist
        """
        if _is_basket := not any([row, column]):
            return CellarSpace.objects.get_or_create_basket(cellar_id)
        else:
            return CellarSpace.objects.get_by_cellar_row_column(cellar_id, row, column)

    def _get_response_dict(self, wine_id, space):
        return {
            "id": wine_id,
            "cellar_id": space.cellar_id if space else None,
            "row": space.row if space else None,
            "column": space.column if space else None,
        }
