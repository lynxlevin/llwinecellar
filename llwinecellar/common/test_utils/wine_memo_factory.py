import factory

from wine_memos.models import WineMemo

from .user_factory import UserFactory


class WineMemoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = WineMemo

    user = factory.SubFactory(UserFactory)
    title = "購入予定リスト"
    entry = "Geverey Chambertin 1er"

