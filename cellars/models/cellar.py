from typing import Optional
from django.db import models
from django.db.models.signals import post_save
from ..enums import CellarSpaceType
import uuid

from users.models import User


class CellarQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["Cellar"]:
        try:
            return self.get(id=id)
        except Cellar.DoesNotExist:
            return None


class Cellar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, blank=True, default="")
    layout = models.JSONField()
    has_basket = models.BooleanField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: CellarQuerySet = CellarQuerySet.as_manager()

    def __str__(self):
        return f"{self.name} ({self.id})"

    @classmethod
    def post_create(cls, sender, instance, created, *args, **kwargs):
        if not created:
            return

        from . import CellarSpace

        cellar_spaces = []
        for index, capacity in enumerate(instance.layout):
            row = index + 1
            for column in range(1, capacity + 1):
                cellar_space = CellarSpace(
                    cellar=instance, row=row, column=column, type=CellarSpaceType.RACK
                )
                cellar_spaces.append(cellar_space)

        CellarSpace.objects.bulk_create(cellar_spaces)


post_save.connect(Cellar.post_create, sender=Cellar)
