import logging

from users.models import User

from ..models import Wine

logger = logging.getLogger(__name__)


class ListWine:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, queries: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        qs = Wine.objects.filter_eq_user_id(user.id).select_cellarspace()

        if cellar_id := queries.get("cellar_id"):
            qs = qs.filter_eq_cellar_id(cellar_id)

        if (is_drunk := queries.get("is_drunk")) is not None:
            qs = qs.filter_is_drunk(is_drunk)

        if (in_cellars := queries.get("in_cellars")) is not None:
            qs = qs.filter_eq_cellarspace__isnull(not in_cellars)

        wines = qs.order_by("created_at").all()

        return wines
