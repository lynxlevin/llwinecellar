from django.contrib.auth.models import AbstractBaseUser, UserManager
from django.db import models


class User(AbstractBaseUser):
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"

    def has_cellar(self, cellar_id) -> bool:
        from cellars.models import Cellar

        if cellar_id is None:
            return False
        cellar = Cellar.objects.filter_eq_user_id(self.id).get_by_id(cellar_id)

        return cellar is not None
