from cellars.models import Cellar
from user_preferences.models import UserPreference
from users.models import User
from wines.models import Wine
from typing import TypedDict, Optional
from wines.enums import Country
from datetime import date


def create_user(username: str, email: str, password: str) -> User:
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return user


def create_user_preference(user: User, drink_whens: list[str]) -> UserPreference:
    user_preference = UserPreference(user=user, drink_whens=drink_whens)
    user_preference.save()
    return user_preference


class CellarParams(TypedDict):
    user: User
    name: Optional[str]
    layout: Optional[list[int]]
    has_basket: Optional[bool]


def create_cellar(params: CellarParams) -> Cellar:
    cellar = Cellar(
        user=params["user"],
        name=params.get("name", "dummy_cellar"),
        layout=params.get("layout", [1, 2, 3]),
        has_basket=params.get("has_basket", False),
    )
    cellar.save()
    return cellar


class WineParams(TypedDict):
    user: User
    drink_when: Optional[str]
    name: Optional[str]
    producer: Optional[str]
    country: Optional[Country]
    region_1: Optional[str]
    region_2: Optional[str]
    region_3: Optional[str]
    region_4: Optional[str]
    region_5: Optional[str]
    cepage: Optional[list[dict[str, str]]]
    vintage: Optional[int]
    bought_at: Optional[date]
    bought_from: Optional[str]
    price_with_tax: Optional[int]
    drunk_at: Optional[date]
    note: Optional[str]


def create_wine(params: WineParams) -> Wine:
    wine = Wine(
        user=params["user"],
        drink_when=params.get("drink_when", ""),
        name=params.get("name", ""),
        producer=params.get("producer", ""),
        country=params.get("country", None),
        region_1=params.get("region_1", ""),
        region_2=params.get("region_2", ""),
        region_3=params.get("region_3", ""),
        region_4=params.get("region_4", ""),
        region_5=params.get("region_5", ""),
        cepage=params.get("cepage", list()),
        vintage=params.get("vintage", None),
        bought_at=params.get("bought_at", None),
        bought_from=params.get("bought_from", ""),
        price_with_tax=params.get("price_with_tax", 0),
        drunk_at=params.get("drunk_at", None),
        note=params.get("note", ""),
    )
    wine.save()
    return wine
