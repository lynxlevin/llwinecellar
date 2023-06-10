import factory

from cellars.models import Cellar

from .user_factory import UserFactory


class CellarFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Cellar

    name = factory.Sequence(lambda n: f"cellar_{n}")
    layout = factory.List([5, 6, 6, 6, 6])
    has_basket = True
    user = factory.SubFactory(UserFactory)
