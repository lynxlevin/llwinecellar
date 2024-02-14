import logging
from typing import TYPE_CHECKING

from ..models import WineMemo

if TYPE_CHECKING:
    from uuid import UUID

    from users.models import User

logger = logging.getLogger(__name__)


class UpdateWineMemo:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", id: "UUID", data: dict) -> WineMemo:
        logger.info(self.__class__.__name__, extra={"user": user, "id": id, "data": data})

        title = data["title"]
        entry = data["entry"]

        wine_memo = WineMemo.objects.get_by_id(id)

        wine_memo.title = title
        wine_memo.entry = entry
        wine_memo.save()

        return wine_memo
