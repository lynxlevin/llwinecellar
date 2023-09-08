from datetime import date, timedelta
from random import randint

import factory
import factory.fuzzy

from cellars.models import CellarSpace
from wines.enums import Country
from wines.models import Cepage, GrapeMaster, Wine, WineTag

from .user_factory import UserFactory


class WineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Wine

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Gevrey Chambertin_{n}")
    producer = "Domaine Charlopin Tissier"
    country = Country.FRANCE
    region_1 = "Bourgogne"
    region_2 = "Côte de Nuits"
    region_3 = "Gevrey Chambertin"
    region_4 = ""
    region_5 = ""
    vintage = 2019
    bought_at = factory.fuzzy.FuzzyDate(date(2022, 1, 1))
    bought_from = "Wine shop"
    price_with_tax = 13200
    drunk_at = None
    note = "Good wine."


class DrunkWineFactory(WineFactory):
    drunk_at = factory.LazyAttribute(lambda wine: wine.bought_at + timedelta(days=randint(0, 365)))


class WineInRackFactory:
    def __new__(cls, row, column, cellar, user, **kwargs):
        wine = WineFactory(user=user, **kwargs)

        cellar_space = cellar.get_rack(row, column)

        if cellar_space:
            cellar_space.wine = wine
            cellar_space.save()
        return wine


class WineInBasketFactory:
    def __new__(cls, cellar, user, **kwargs):
        wine = WineFactory(user=user, **kwargs)

        cellar_space = CellarSpace.objects.get_or_create_basket(cellar.id)
        cellar_space.wine = wine
        cellar_space.save()
        return wine


class GrapeMasterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GrapeMaster

    name = "Pinot Noir"
    abbreviation = "PN"
    user = factory.SubFactory(UserFactory)


class CepageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Cepage


class WineTagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = WineTag

    text = factory.fuzzy.FuzzyText()
    user = factory.SubFactory(UserFactory)
