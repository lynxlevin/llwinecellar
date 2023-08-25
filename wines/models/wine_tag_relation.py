import uuid

from django.db import models

from .wine import Wine
from .wine_tag import WineTag


class WineTagRelationQuerySet(models.QuerySet["WineTagRelation"]):
    pass


class WineTagRelation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tag_master = models.ForeignKey(WineTag, on_delete=models.CASCADE)
    wine = models.ForeignKey(Wine, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: WineTagRelationQuerySet = WineTagRelationQuerySet.as_manager()
