import uuid
from typing import Optional, Union

from django.db import models
from django.db.models import Q

from cellars.enums import CellarSpaceType
from users.models import User

from ..enums import Country


class WineQuerySet(models.QuerySet["Wine"]):
    def get_by_id(self, id) -> Optional["Wine"]:
        try:
            return self.get(id=id)
        except Wine.DoesNotExist:
            return None

    def filter_eq_user_id(self, user_id) -> "WineQuerySet":
        return self.filter(user_id=user_id)

    def filter_eq_name(self, name: str) -> "WineQuerySet":
        return self.filter(name=name)

    def filter_eq_producer(self, producer: str) -> "WineQuerySet":
        return self.filter(producer=producer)

    def filter_eq_name_or_producer(self, name_or_producer: str) -> "WineQuerySet":
        return self.filter(
            Q(name__unaccent__icontains=name_or_producer) | Q(producer__unaccent__icontains=name_or_producer)
        )

    def filter_eq_country(self, country_capital: str) -> "WineQuerySet":
        return self.filter(_country=Country.from_label(country_capital).value)

    def filter_eq_cellar_id(self, cellar_id) -> "WineQuerySet":
        return self.filter(cellarspace__cellar_id=cellar_id)

    def filter_is_drunk(self, flag=True) -> "WineQuerySet":
        return self.filter(drunk_at__isnull=not flag)

    def filter_gte_drunk_at(self, gte) -> "WineQuerySet":
        return self.filter(drunk_at__gte=gte)

    def filter_lte_drunk_at(self, lte) -> "WineQuerySet":
        return self.filter(drunk_at__lte=lte)

    def filter_eq_cellarspace__isnull(self, flag=True) -> "WineQuerySet":
        return self.filter(cellarspace__isnull=flag)

    def select_cellarspace(self) -> "WineQuerySet":
        return self.select_related("cellarspace")

    def prefetch_cepages(self) -> "WineQuerySet":
        return self.prefetch_related("cepages").prefetch_related("cepages__grape")

    def prefetch_tags(self) -> "WineQuerySet":
        return self.prefetch_related("tags")


class Wine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=256)
    producer = models.CharField(blank=True, default="", max_length=128)
    _country = models.IntegerField(db_column="country", choices=Country.choices_for_model(), blank=True, null=True)
    _country_str = models.CharField(db_column="country_str", max_length=64, blank=True, null=True)
    region_1 = models.CharField(blank=True, default="", max_length=128)
    region_2 = models.CharField(blank=True, default="", max_length=128)
    region_3 = models.CharField(blank=True, default="", max_length=128)
    region_4 = models.CharField(blank=True, default="", max_length=128)
    region_5 = models.CharField(blank=True, default="", max_length=128)
    vintage = models.PositiveSmallIntegerField(blank=True, null=True)
    bought_at = models.DateField(blank=True, null=True)
    bought_from = models.CharField(blank=True, default="", max_length=64)
    price = models.PositiveIntegerField(blank=True, null=True)
    drunk_at = models.DateField(blank=True, null=True)
    note = models.TextField(blank=True, default="")
    tags = models.ManyToManyField("WineTag", through="WineTagRelation")
    value = models.PositiveSmallIntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: WineQuerySet = WineQuerySet.as_manager()

    @property
    def country(self):
        if self._country is None:
            return None
        return Country(self._country)

    @country.setter
    def country(self, country: Optional[Union[Country, str]]):
        if country is None:
            self._country = None
            self._country_str = None
        elif isinstance(country, str):
            country_ = Country.from_label(country)
            self._country = country_.value
            self._country_str = country_.name
        else:
            self._country = country.value
            self._country_str = country.name

    @property
    def cellar_id(self):
        if hasattr(self, "cellarspace"):
            return self.cellarspace.cellar_id
        else:
            return None

    @property
    def row(self) -> int:
        if hasattr(self, "cellarspace"):
            return self.cellarspace.row
        else:
            return None

    @property
    def column(self) -> int:
        if hasattr(self, "cellarspace"):
            return self.cellarspace.column
        else:
            return None

    @property
    def position(self) -> Optional[str]:
        if not hasattr(self, "cellarspace"):
            return None
        if self.cellarspace.type == CellarSpaceType.BASKET:
            return "basket"
        return f"{self.row}-{self.column}"

    @property
    def tag_texts(self) -> list[str]:
        return [tag.text for tag in self.tags.all()]
