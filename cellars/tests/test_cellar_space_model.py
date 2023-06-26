from django.db.utils import IntegrityError
from django.test import TestCase

from cellars.enums import CellarSpaceType
from cellars.models import CellarSpace
from llwinecellar.common.test_utils import CellarFactory


class TestCellarSpaceModel(TestCase):
    def test_constraint__error__same_row_and_column_same_cellar(self):
        cellar = CellarFactory()
        duplicate_cellar_space = CellarSpace(cellar=cellar, row=1, column=1, type=CellarSpaceType.RACK)

        with self.assertRaises(IntegrityError):
            duplicate_cellar_space.save()

    def test_constraint__ok__multiple_baskets(self):
        cellar = CellarFactory()
        basket = CellarSpace(cellar=cellar, type=CellarSpaceType.BASKET)
        basket.save()

        another_basket = CellarSpace(cellar=cellar, type=CellarSpaceType.BASKET)
        another_basket.save()

    def test_constraint__ok__same_row_and_column_different_cellar(self):
        cellar = CellarFactory()
        _another_cellar = CellarFactory(user=cellar.user)

    def test_create_basket(self):
        cellar = CellarFactory()
        created = CellarSpace.objects.create_basket(cellar_id=cellar.id)

        self.assertEqual(cellar.id, created.cellar_id)
        self.assertEqual(CellarSpaceType.BASKET, created.type)
        self.assertIsNone(created.wine)
        self.assertIsNone(created.row)
        self.assertIsNone(created.column)

    def test_get_by_cellar_row_column(self):
        cellar = CellarFactory()
        cellar_space = CellarSpace.objects.get_by_cellar_row_column(cellar.id, 2, 3)

        self.assertEqual(cellar.id, cellar_space.cellar_id)
        self.assertEqual(2, cellar_space.row)
        self.assertEqual(3, cellar_space.column)
