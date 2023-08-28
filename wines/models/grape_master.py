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


class GrapeMaster(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField()
    abbreviation = models.CharField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = (
            models.UniqueConstraint(
                fields=["name", "user"],
                name="unique_name_user",
            ),
        )

    objects: GrapeMasterQuerySet = GrapeMasterQuerySet.as_manager()
