from django.contrib.auth.models import AbstractBaseUser, UserManager
from django.db import models


class User(AbstractBaseUser):
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
