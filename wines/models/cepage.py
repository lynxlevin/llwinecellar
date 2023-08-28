import uuid
from typing import Optional

from django.db import models


class CepageQuerySet(models.QuerySet["Cepage"]):
    def get_by_id(self, id) -> Optional["Cepage"]:
        try:
            return self.get(id=id)
        except Cepage.DoesNotExist:
            return None


class Cepage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wine = models.ForeignKey("Wine", on_delete=models.CASCADE, related_name="cepages")
    grape = models.ForeignKey("GrapeMaster", on_delete=models.CASCADE)
    percentage = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: CepageQuerySet = CepageQuerySet.as_manager()

    @property
    def name(self) -> str:
        return self.grape.name

    @property
    def abbreviation(self) -> str:
        return self.grape.abbreviation
