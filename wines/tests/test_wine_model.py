from django.test import TestCase

from llwinecellar.common.test_utils import TestSeed, factory
from wines.models import Wine


class TestWineModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.user = cls.seeds.users[0]

    def test_get_by_id(self):
        wine = factory.create_wine({"user": self.seeds.users[0]})

        result = Wine.objects.get_by_id(wine.id)

        self.assertEqual(result, wine)

    def test_filter_eq_user_id(self):
        wines = [
            factory.create_wine({"user": self.user, "name": "test_wine_1"}),
            factory.create_wine({"user": self.user, "name": "test_wine_2"}),
        ]
        _wine_different_user = factory.create_wine(
            {"user": self.seeds.users[1], "name": "different_user's_wine"}
        )

        result = Wine.objects.filter_eq_user_id(self.user.id)

        self.assertEqual(len(wines), result.count())

        result = result.iterator()
        for wine in wines:
            self.assertEqual(wine.name, next(result).name)
