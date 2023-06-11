from django.test import TestCase

from llwinecellar.common.test_utils import CellarFactory, DrunkWineFactory, PlacedWineFactory, UserFactory, WineFactory
from wines.models import Wine


class TestWineModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.cellars = [
            CellarFactory(user=cls.user),
            CellarFactory(user=cls.user),
        ]
        cls.wines_in_cellar1 = [
            PlacedWineFactory(row=1, column=1, cellar=cls.cellars[0], user=cls.user),
        ]
        cls.wines_in_cellar2 = [
            PlacedWineFactory(row=1, column=1, cellar=cls.cellars[1], user=cls.user),
        ]
        cls.wines_not_in_cellar = [WineFactory(user=cls.user)]
        cls.wines_drunk = [DrunkWineFactory(user=cls.user)]
        cls.wines_different_user = [WineFactory()]

    def test_get_by_id(self):
        wine = WineFactory(user=self.user)

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

    def test_filter_eq_cellarspace__isnull(self):
        wines_not_in_cellar = Wine.objects.filter_eq_cellarspace__isnull().order_by("created_at")
        expected = [*self.wines_not_in_cellar, *self.wines_drunk, *self.wines_different_user]

        self._assert_filtered_wines(expected, wines_not_in_cellar)

    """
    Utility Functions
    """

    def _assert_filtered_wines(self, expected, filtered):
        self.assertEqual(len(expected), filtered.count())

        filtered = filtered.iterator()
        for wine in expected:
            self.assertEqual(wine.name, next(filtered).name)
