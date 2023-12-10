import logging

from rest_framework import exceptions

from users.models import User

from ...models import GrapeMaster

logger = logging.getLogger(__name__)


class DeleteGrapeMaster:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, grape_master_id: str, force_delete: bool):
        logger.info(
            self.__class__.__name__, extra={"user": user, "tag_text": grape_master_id, "force_delete": force_delete}
        )

        grape_to_delete = GrapeMaster.objects.filter_eq_user_id(user.id).get_by_id(grape_master_id)

        if grape_to_delete is None:
            return

        if grape_to_delete.cepages.exists():
            if force_delete:
                return grape_to_delete.delete()
            else:
                raise exceptions.ValidationError(detail="Assigned grape, use force_delete.")

        return grape_to_delete.delete()
