import logging
from typing import TYPE_CHECKING

from ..models import WineMemo

if TYPE_CHECKING:
    from users.models import User

logger = logging.getLogger(__name__)


class CreateWineMemo:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", data: dict) -> WineMemo:
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        title = data["title"]
        entry = data["entry"]

        wine_memo = WineMemo.objects.create(
            title=title,
            entry=entry,
            user=user,
        )

        return wine_memo
