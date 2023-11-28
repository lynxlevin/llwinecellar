import logging
from typing import TYPE_CHECKING, Optional

from users.models import User

from ..models import Wine

if TYPE_CHECKING:
    from datetime import date

logger = logging.getLogger(__name__)


# MYMEMO: maybe rename to PriceSum
class AggregateWines:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, queries: dict):
        logger.info(self.__class__.__name__, extra={"user_id": user.id, "queries": queries})

        is_drunk: Optional[bool] = queries.get("is_drunk")
        drunk_at__gte: Optional["date"] = queries.get("drunk_at__gte")
        drunk_at__lte: Optional["date"] = queries.get("drunk_at__lte")

        logger.debug("type(drunk_at__gte)", extra={"type(drunk_at__gte)": str(type(drunk_at__gte))})  # MYMEMO: debug

        qs = Wine.objects.filter_eq_user_id(user.id).filter_eq_price_with_tax__isnull(False)

        if is_drunk is not None:
            qs = qs.filter_is_drunk(is_drunk)

        if drunk_at__gte is not None:
            qs = qs.filter(drunk_at__gte=drunk_at__gte)

        if drunk_at__lte is not None:
            qs = qs.filter(drunk_at__lte=drunk_at__lte)

        aggregation = sum(qs.values_list("price_with_tax", flat=True))

        return aggregation

    # MYMEMO: add filter_eq_cellar_id
