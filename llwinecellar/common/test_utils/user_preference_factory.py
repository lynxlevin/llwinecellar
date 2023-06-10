import factory

from user_preferences.models import UserPreference

from .user_factory import UserFactory


class UserPreferenceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserPreference

    user = factory.SubFactory(UserFactory)
    drink_whens = factory.List(["デイリー", "そのうち", "数年寝かす", "10年弱寝かす", "10年強寝かす", "たくさん寝かす"])
