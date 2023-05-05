from django.db import models


class CellarSpaceType(models.IntegerChoices):
    RACK = 1
    BASKET = 2
