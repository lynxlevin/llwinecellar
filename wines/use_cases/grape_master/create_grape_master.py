import logging

from rest_framework.exceptions import ValidationError

from users.models import User

from ...models import GrapeMaster

logger = logging.getLogger(__name__)


class CreateGrapeMaster:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict):
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        if GrapeMaster.objects.get_by_user_id_and_name(user.id, data.get("name")) is not None:
            raise ValidationError(detail="This grape master with this name already exists.")

        grape_master = GrapeMaster.objects.create(**data, user=user)

        return grape_master
