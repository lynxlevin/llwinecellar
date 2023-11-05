import logging

from users.models import User

from ..enums import Country
from ..models import Wine

logger = logging.getLogger(__name__)


class ListWineRegions:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User):
        logger.info(self.__class__.__name__, extra={"user": user})

        region_values = (
            Wine.objects.filter_eq_user_id(user.id)
            .values("_country_str", "region_1", "region_2", "region_3", "region_4", "region_5")
            .distinct()
        )

        regions = sorted(
            [
                f"{Country[r['_country_str']].label}>{r['region_1']}>{r['region_2']}>{r['region_3']}>{r['region_4']}>{r['region_5']}"
                for r in region_values
                if r["_country_str"]
            ]
        )

        return regions
