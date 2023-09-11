import uuid
from typing import Optional

from django.db import models

from users.models import User


class WineTagQuerySet(models.QuerySet["WineTag"]):
    def get_by_id(self, id) -> Optional["WineTag"]:
        try:
            return self.get(id=id)
        except WineTag.DoesNotExist:
            return None

    def filter_eq_user_id(self, user_id) -> "WineTagQuerySet":
        return self.filter(user_id=user_id)


class WineTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=256)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = (
            models.UniqueConstraint(
                fields=["text", "user"],
                name="unique_text_user",
            ),
        )

    objects: WineTagQuerySet = WineTagQuerySet.as_manager()
