import uuid
from typing import Optional

from django.db import models

from users.models import User


class GrapeMasterQuerySet(models.QuerySet["GrapeMaster"]):
    def get_by_id(self, id) -> Optional["GrapeMaster"]:
        try:
            return self.get(id=id)
        except GrapeMaster.DoesNotExist:
            return None

    def get_by_user_id_and_name(self, user_id, name) -> Optional["GrapeMaster"]:
        try:
            return self.get(user_id=user_id, name=name)
        except GrapeMaster.DoesNotExist:
            return None

    def filter_eq_user_id(self, user_id) -> "GrapeMasterQuerySet":
        return self.filter(user_id=user_id)


class GrapeMaster(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField()
    abbreviation = models.CharField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # MYMEMO: this constraint complains when abbreviation differs from registered GrapeMaster
        constraints = (
            models.UniqueConstraint(
                fields=["name", "user"],
                name="unique_name_user",
            ),
        )

    objects: GrapeMasterQuerySet = GrapeMasterQuerySet.as_manager()
