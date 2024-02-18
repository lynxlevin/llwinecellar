import uuid
from typing import TYPE_CHECKING, Optional

from django.db import models

from users.models import User

if TYPE_CHECKING:
    from uuid import UUID


class WineMemoQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["WineMemo"]:
        try:
            return self.get(id=id)
        except WineMemo.DoesNotExist:
            return None

    def filter_eq_user_id(self, user_id: "UUID") -> "WineMemoQuerySet":
        return self.filter(user_id=user_id)

    def order_by_updated_at(self, desc: bool=False) -> "WineMemoQuerySet":
        key = "-updated_at" if desc else "updated_at"
        return self.order_by(key)


class WineMemo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(blank=False, max_length=128)
    entry = models.TextField(default="", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: WineMemoQuerySet = WineMemoQuerySet.as_manager()

    def __repr__(self):
        return f"<WineMemo({str(self.id)}, {self.title})>"
