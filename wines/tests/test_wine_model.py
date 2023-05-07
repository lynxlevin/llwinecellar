from django.test import TestCase

from llwinecellar.common.test_utils import TestSeed, factory
from wines.models import Wine


class TestWineModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.user = cls.seeds.users[0]
        cls.cellars = [
            factory.create_cellar(
                {"user": cls.user, "layout": [5], "name": "cellar 1"}
            ),
            factory.create_cellar(
                {"user": cls.user, "layout": [6], "name": "cellar 2"}
            ),
        ]
        cls.wines_in_cellar1 = [
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "test_wine_1",
                    "position": "1-1",
                    "cellar_id": cls.cellars[0].id,
                }
            ),
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "test_wine_2",
                    "position": "1-2",
                    "cellar_id": cls.cellars[0].id,
                }
            ),
        ]
        cls.wines_in_cellar2 = [
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "test_wine_3",
                    "position": "1-1",
                    "cellar_id": cls.cellars[1].id,
                }
            ),
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "test_wine_4",
                    "position": "1-2",
                    "cellar_id": cls.cellars[1].id,
                }
            ),
        ]
        cls.wines_not_in_cellar = [
            factory.create_wine({"user": cls.user, "name": "test_wine_5"}),
            factory.create_wine({"user": cls.user, "name": "test_wine_6"}),
        ]
        cls.wine_different_user = factory.create_wine(
            {"user": cls.seeds.users[1], "name": "different_user's_wine"}
        )

    def test_get_by_id(self):
        wine = factory.create_wine({"user": self.seeds.users[0]})

        result = Wine.objects.get_by_id(wine.id)

        self.assertEqual(result, wine)

    def test_filter_eq_user_id(self):
        result = Wine.objects.filter_eq_user_id(self.user.id)

        expected_wines = [
            *self.wines_in_cellar1,
            *self.wines_in_cellar2,
            *self.wines_not_in_cellar,
        ]

        self.assertEqual(len(expected_wines), result.count())

        result = result.iterator()
        for wine in expected_wines:
            self.assertEqual(wine.name, next(result).name)

    def test_filter_eq_cellar_id(self):
        result = Wine.objects.filter_eq_cellar_id(self.cellars[0].id)

        expected_wines = self.wines_in_cellar1
        self.assertEqual(len(expected_wines), result.count())

        result = result.iterator()
        for wine in expected_wines:
            self.assertEqual(wine.name, next(result).name)
