from cellars.models import Cellar
from users.models import User


def create_user(username: str, email: str, password: str) -> User:
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return user


def create_cellar(
    name: str, layout: list[int], basket_capacity: int, user: User
) -> Cellar:
    cellar = Cellar(
        name=name, layout=layout, basket_capacity=basket_capacity, user=user
    )
    cellar.save()
    return cellar
