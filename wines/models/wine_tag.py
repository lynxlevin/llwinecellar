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


class WineTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=256, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: WineTagQuerySet = WineTagQuerySet.as_manager()
