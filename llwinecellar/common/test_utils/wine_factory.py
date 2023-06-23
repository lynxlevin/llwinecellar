from datetime import date, timedelta
from random import choice, randint

import factory
import factory.fuzzy

from cellars.models import CellarSpace
from wines.enums import Country
from wines.models import Wine

from .user_factory import UserFactory


def _select_drink_when(obj):
    user_preference = obj.user.userpreference
    drink_whens = user_preference.drink_whens
    return choice(drink_whens)


class WineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Wine

    drink_when = factory.LazyAttribute(lambda obj: _select_drink_when(obj))
    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Gevrey Chambertin_{n}")
    producer = "Domaine Charlopin Tissier"
    country = Country.FRANCE
    region_1 = "Bourgogne"
    region_2 = "Côte de Nuits"
    region_3 = "Gevrey Chambertin"
    region_4 = ""
    region_5 = ""
    cepage = factory.List([{"grape": "Pinot Noir", "percent": 100}])
    vintage = 2019
    bought_at = factory.fuzzy.FuzzyDate(date(2022, 1, 1))
    bought_from = "Wine shop"
    price_with_tax = 13200
    drunk_at = None
    note = "Good wine."


class DrunkWineFactory(WineFactory):
    drunk_at = factory.LazyAttribute(lambda wine: wine.bought_at + timedelta(days=randint(0, 365)))


class PlacedWineFactory:
    def __new__(cls, row, column, cellar, user, **kwargs):
        wine = WineFactory(user=user, **kwargs)

        # FIXME: handle error on non_existent row and column
        cellar_space = CellarSpace.objects.get_by_cellar_row_column(
            cellar_id=cellar.id, row=row, column=column
        )  # MYMEMO: cellar.get_space_by_row_and_column のほうが良さそう
        cellar_space.wine = wine
        cellar_space.save()
        return wine
