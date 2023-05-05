from typing import Optional
from django.db import models

from . import Cellar
from ..enums import CellarSpaceType
from wines.models import Wine


class CellarSpaceQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["CellarSpace"]:
        try:
            return self.get(id=id)
        except CellarSpace.DoesNotExist:
            return None


class CellarSpace(models.Model):
    cellar = models.ForeignKey(Cellar, on_delete=models.CASCADE)
    wine = models.ForeignKey(Wine, on_delete=models.SET_NULL, null=True)
    row = models.PositiveSmallIntegerField(blank=True, null=True)
    column = models.PositiveSmallIntegerField(blank=True, null=True)
    type = models.IntegerField(
        choices=CellarSpaceType.choices, default=CellarSpaceType.RACK
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: CellarSpaceQuerySet = CellarSpaceQuerySet.as_manager()

    def __str__(self):
        return f"{self.name} ({self.id})"
