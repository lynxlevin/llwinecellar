from typing import Optional
from django.db import models
from users.models import User


class UserPreferenceQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["UserPreference"]:
        try:
            return self.get(id=id)
        except UserPreference.DoesNotExist:
            return None


class UserPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    drink_when = models.JSONField()

    objects: UserPreferenceQuerySet = UserPreferenceQuerySet.as_manager()
