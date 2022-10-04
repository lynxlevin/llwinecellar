from cellars.models import Cellar
from user_preferences.models import UserPreference, user_preference
from users.models import User


def create_user(username: str, email: str, password: str) -> User:
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return user


def create_user_preference(user: User, drink_when: list[str]) -> UserPreference:
    user_preference = UserPreference(user=user, drink_when=drink_when)
    user_preference.save()
    return user_preference


def create_cellar(
    name: str, layout: list[int], basket_capacity: int, user: User
) -> Cellar:
    cellar = Cellar(
        name=name, layout=layout, basket_capacity=basket_capacity, user=user
    )
    cellar.save()
    return cellar
