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

        cellar_space = CellarSpace.objects.get_by_cellar_row_column(**data)

        cellar_space.wine = wine
        cellar_space.save()

        return {
            "wines": [
                {
                    "id": wine.id,
                    "cellar_id": cellar_space.cellar_id,
                    "row": cellar_space.row,
                    "column": cellar_space.column,
                },
            ],
        }
