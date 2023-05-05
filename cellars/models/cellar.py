from typing import Optional
from django.db import models

from users.models import User


class CellarQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["Cellar"]:
        try:
            return self.get(id=id)
        except Cellar.DoesNotExist:
            return None


# MYMEMO: change to uuid
class Cellar(models.Model):
    name = models.CharField(max_length=255, blank=True, default="")
    layout = models.JSONField()
    has_basket = models.BooleanField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: CellarQuerySet = CellarQuerySet.as_manager()

    def __str__(self):
        return f"{self.name} ({self.id})"
