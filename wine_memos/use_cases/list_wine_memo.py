import logging
from typing import TYPE_CHECKING

from ..models import WineMemo

if TYPE_CHECKING:
    from users.models import User

    from ..models.wine_memo import WineMemoQuerySet

logger = logging.getLogger(__name__)


class ListWineMemo:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User") -> "WineMemoQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user})

        wine_memos = WineMemo.objects.filter_eq_user_id(user.id).order_by_updated_at(desc=True)

        return wine_memos
