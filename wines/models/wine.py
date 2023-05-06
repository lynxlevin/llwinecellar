import uuid
from typing import Optional

from django.db import models

from users.models import User

from ..enums import Country


class WineQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["Wine"]:
        try:
            return self.get(id=id)
        except Wine.DoesNotExist:
            return None


class Wine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # MYMEMO: enforce choice on validation.
    drink_when = models.TextField(blank=True, default="")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(blank=True, default="", max_length=256)
    producer = models.CharField(blank=True, default="", max_length=128)
    country = models.IntegerField(choices=Country.choices, blank=True, null=True)
    region_1 = models.CharField(blank=True, default="", max_length=128)
    region_2 = models.CharField(blank=True, default="", max_length=128)
    region_3 = models.CharField(blank=True, default="", max_length=128)
    region_4 = models.CharField(blank=True, default="", max_length=128)
    region_5 = models.CharField(blank=True, default="", max_length=128)
    # "[{'grape': 'pinot_noir', 'percent': 100}] or [{'grape': 'pinot_noir'}]"
    cepage = models.JSONField(blank=True, default=list)
    vintage = models.PositiveSmallIntegerField(blank=True, null=True)
    bought_at = models.DateField(blank=True, null=True)
    bought_from = models.CharField(blank=True, default="", max_length=64)
    price_with_tax = models.PositiveIntegerField(blank=True, null=True)
    drunk_at = models.DateField(blank=True, null=True)
    note = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: WineQuerySet = WineQuerySet.as_manager()
