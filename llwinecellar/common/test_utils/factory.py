from cellars.models import Cellar
from user_preferences.models import UserPreference, user_preference
from users.models import User
from wines.models import Wine


def create_user(username: str, email: str, password: str) -> User:
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return user


def create_user_preference(user: User, drink_whens: list[str]) -> UserPreference:
    user_preference = UserPreference(user=user, drink_whens=drink_whens)
    user_preference.save()
    return user_preference


def create_cellar(name: str, layout: list[int], has_basket: bool, user: User) -> Cellar:
    cellar = Cellar(name=name, layout=layout, has_basket=has_basket, user=user)
    cellar.save()
    return cellar


def create_wine(param: dict) -> Wine:
    wine = Wine(
        drink_when=param.get("drink_when", ""),
        user=param["user"],
        name=param.get("name", ""),
        producer=param.get("producer", ""),
        country=param.get("country", None),
        region_1=param.get("region_1", ""),
        region_2=param.get("region_2", ""),
        region_3=param.get("region_3", ""),
        region_4=param.get("region_4", ""),
        region_5=param.get("region_5", ""),
        cepage=param.get("cepage", list()),
        vintage=param.get("vintage", None),
        bought_at=param.get("bought_at", None),
        bought_from=param.get("bought_from", ""),
        price_with_tax=param.get("price_with_tax", 0),
        drunk_at=param.get("drunk_at", None),
        note=param.get("note", ""),
    )
    wine.save()
    return wine
