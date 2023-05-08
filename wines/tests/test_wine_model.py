from datetime import datetime

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
            factory.create_cellar({"user": cls.user, "layout": [5], "name": "cellar 1"}),
            factory.create_cellar({"user": cls.user, "layout": [6], "name": "cellar 2"}),
        ]
        cls.wines_in_cellar1 = [
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "wine_in_cellar1",
                    "position": "1-1",
                    "cellar_id": cls.cellars[0].id,
                }
            ),
        ]
        cls.wines_in_cellar2 = [
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "wine_in_cellar2",
                    "position": "1-1",
                    "cellar_id": cls.cellars[1].id,
                }
            ),
        ]
        cls.wines_not_in_cellar = [factory.create_wine({"user": cls.user, "name": "wine_not_in_cellar"})]
        cls.wines_drunk = [
            factory.create_wine({"user": cls.user, "name": "wine_drunk", "drunk_at": datetime.now().date()})
        ]
        cls.wine_different_user = factory.create_wine({"user": cls.seeds.users[1], "name": "different_user's_wine"})

    def test_get_by_id(self):
        wine = factory.create_wine({"user": self.seeds.users[0]})

        result = Wine.objects.get_by_id(wine.id)

        self.assertEqual(result, wine)

    def test_filter_eq_user_id(self):
        result = Wine.objects.filter_eq_user_id(self.user.id)
        expected = [
            *self.wines_in_cellar1,
            *self.wines_in_cellar2,
            *self.wines_not_in_cellar,
            *self.wines_drunk,
        ]

        self._assert_filtered_wines(expected, result)

    def test_filter_eq_cellar_id(self):
        result = Wine.objects.filter_eq_cellar_id(self.cellars[0].id)
        expected = self.wines_in_cellar1

        self._assert_filtered_wines(expected, result)

    def test_filter_is_drunk(self):
        result = Wine.objects.filter_is_drunk()
        expected = self.wines_drunk

        self._assert_filtered_wines(expected, result)

    """
    Utility Functions
    """

    def _assert_filtered_wines(self, expected, filtered):
        self.assertEqual(len(expected), filtered.count())

        filtered = filtered.iterator()
        for wine in expected:
            self.assertEqual(wine.name, next(filtered).name)
