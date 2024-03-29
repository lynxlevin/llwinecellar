import uuid
from typing import Optional

from django.db import models

from wines.models import Wine

from ..enums import CellarSpaceType
from . import Cellar


class CellarSpaceQuerySet(models.QuerySet):
    def get_by_cellar_row_column(self, cellar_id, row, column) -> Optional["CellarSpace"]:
        try:
            return self.get(cellar_id=cellar_id, row=row, column=column)
        except CellarSpace.DoesNotExist:
            return None

    def get_by_wine_id(self, wine_id) -> Optional["CellarSpace"]:
        try:
            return self.get(wine_id=wine_id)
        except CellarSpace.DoesNotExist:
            return None

    def get_or_create_empty_basket(self, cellar_id) -> Optional["CellarSpace"]:
        cellar = Cellar.objects.get_by_id(cellar_id)
        if not cellar.has_basket:
            return None

        basket = self.filter(cellar_id=cellar_id, type=CellarSpaceType.BASKET, wine_id=None).first()
        if basket is None:
            basket = self.create(cellar_id=cellar_id, type=CellarSpaceType.BASKET)

        return basket

    def filter_by_type(self, type: CellarSpaceType) -> "CellarSpaceQuerySet":
        return self.filter(type=type)

    def filter_empty(self) -> "CellarSpaceQuerySet":
        return self.filter(wine__isnull=True)

    def order_by_position(self) -> "CellarSpaceQuerySet":
        return self.order_by("row", "column")


class CellarSpace(models.Model):
    """
    Spaces for rack are automatically created on Cellar creation.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cellar = models.ForeignKey(Cellar, on_delete=models.CASCADE)
    wine = models.OneToOneField(Wine, on_delete=models.SET_NULL, null=True)
    row = models.PositiveSmallIntegerField(blank=True, null=True)
    column = models.PositiveSmallIntegerField(blank=True, null=True)
    type = models.IntegerField(choices=CellarSpaceType.choices, default=CellarSpaceType.RACK)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # MYMEMO(後日): might need to worry about order in basket.

    class Meta:
        constraints = (
            models.UniqueConstraint(
                fields=["row", "column", "cellar"],
                name="unique_row_column_for_rack",
                condition=models.Q(type=CellarSpaceType.RACK),
            ),
        )

    objects: CellarSpaceQuerySet = CellarSpaceQuerySet.as_manager()

    def __str__(self):
        return f"{__class__.__name__}: Cellar: {self.cellar.name}, {self.row}-{self.column}"
