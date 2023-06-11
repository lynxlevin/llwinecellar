import factory
import factory.fuzzy

from user_preferences.models import UserPreference
from users.models import User


class UserPreferenceFactory(factory.django.DjangoModelFactory):
    """
    Automatically created on initializing UserFactory.
    """

    class Meta:
        model = UserPreference

    drink_whens = factory.fuzzy.FuzzyChoice(
        [
            ["デイリー", "そのうち", "数年寝かす", "10年弱寝かす", "10年強寝かす", "たくさん寝かす"],
            ["2025", "2030", "2035", "2040", "2045", "2050"],
            ["Daily", "Anytime", "Several years", "Less than 10y", "More than 10y", "Far future"],
            ["in a few years", "in 5 years", "later than a decade"],
        ]
    )


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user_{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")

    userpreference = factory.RelatedFactory(
        UserPreferenceFactory,
        factory_related_name="user",
    )
