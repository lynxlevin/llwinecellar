from typing import Optional

from django.contrib.auth.models import AbstractBaseUser
from django.db import models


class UserQuerySet(models.QuerySet):
    def get_by_id(self, user_id) -> Optional["User"]:
        try:
            return self.get(id=user_id)
        except User.DoesNotExist:
            return None

    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError("Users must have an email address")

        if not username:
            raise ValueError("Users must have a username")

        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

    objects: UserQuerySet = UserQuerySet.as_manager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
