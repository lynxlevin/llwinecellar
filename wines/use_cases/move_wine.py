import logging

from cellars.models import CellarSpace
from users.models import User

from ..models import Wine

logger = logging.getLogger(__name__)


class MoveWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, wine_id: str, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "wine_id": wine_id, "data": data})

        wine = Wine.objects.select_cellarspace().get_by_id(wine_id)

        from_cellar_space = wine.cellarspace if hasattr(wine, "cellarspace") else None
        to_cellar_space = CellarSpace.objects.get_by_cellar_row_column(**data)

        if from_cellar_space:
            another_wine_id = to_cellar_space.wine_id
            from_cellar_space.wine_id = None
            from_cellar_space.save(update_fields=["wine_id", "updated_at"])
        to_cellar_space.wine = wine
        to_cellar_space.save(update_fields=["wine_id", "updated_at"])
        if from_cellar_space and another_wine_id is not None:
            from_cellar_space.wine_id = another_wine_id
            from_cellar_space.save(update_fields=["wine_id", "updated_at"])

            return {
                "wines": [
                    {
                        "id": wine.id,
                        "cellar_id": to_cellar_space.cellar_id,
                        "row": to_cellar_space.row,
                        "column": to_cellar_space.column,
                    },
                    {
                        "id": another_wine_id,
                        "cellar_id": from_cellar_space.cellar_id,
                        "row": from_cellar_space.row,
                        "column": from_cellar_space.column,
                    },
                ],
            }
        else:
            return {
                "wines": [
                    {
                        "id": wine.id,
                        "cellar_id": to_cellar_space.cellar_id,
                        "row": to_cellar_space.row,
                        "column": to_cellar_space.column,
                    },
                ],
            }
