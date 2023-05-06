from django.test import TestCase
from django.db.utils import IntegrityError
from cellars.models import CellarSpace
from cellars.enums import CellarSpaceType
from llwinecellar.common.test_utils import factory, TestSeed


class TestCellarSpaceModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_constraint__error__same_row_and_column_same_cellar(self):
        cellar = factory.create_cellar(
            {"layout": [5, 6, 6, 6, 6], "user": self.seeds.users[0]}
        )
        duplicate_cellar_space = CellarSpace(
            cellar=cellar, row=1, column=1, type=CellarSpaceType.RACK
        )

        with self.assertRaises(IntegrityError):
            duplicate_cellar_space.save()

    def test_constraint__ok__multiple_baskets(self):
        cellar = factory.create_cellar(
            {"layout": [5, 6, 6, 6, 6], "user": self.seeds.users[0]}
        )
        cellar_space = CellarSpace(cellar=cellar, type=CellarSpaceType.BASKET)
        cellar_space.save()

        another_cellar_space = CellarSpace(cellar=cellar, type=CellarSpaceType.BASKET)
        another_cellar_space.save()

    def test_constraint__ok__same_row_and_column_different_cellar(self):
        _cellar = factory.create_cellar(
            {"layout": [5, 6, 6, 6, 6], "user": self.seeds.users[0]}
        )
        _another_cellar = factory.create_cellar(
            {"layout": [5, 6, 6, 6, 6], "user": self.seeds.users[0]}
        )

    def test_get_by_cellar_row_column(self):
        cellar = factory.create_cellar(
            {"layout": [5, 6, 6, 6, 6], "user": self.seeds.users[0]}
        )
        cellar_space = CellarSpace.objects.get_by_cellar_row_column(cellar.id, 2, 3)

        self.assertEqual(cellar.id, cellar_space.cellar_id)
        self.assertEqual(2, cellar_space.row)
        self.assertEqual(3, cellar_space.column)
