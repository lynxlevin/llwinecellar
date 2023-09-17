from django.db.utils import IntegrityError
from django.test import TestCase

from cellars.enums import CellarSpaceType
from cellars.models import CellarSpace
from llwinecellar.common.test_utils import CellarFactory, CellarSpaceFactory, WineInBasketFactory, WineInRackFactory


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

    def test_get_by_cellar_row_column(self):
        cellar = CellarFactory()

        cellar_space = CellarSpace.objects.get_by_cellar_row_column(cellar.id, 2, 3)

        self.assertEqual(cellar.id, cellar_space.cellar_id)
        self.assertEqual(2, cellar_space.row)
        self.assertEqual(3, cellar_space.column)

    def test_get_by_wine_id(self):
        cellar = CellarFactory()
        wine = WineInBasketFactory(cellar=cellar, user=cellar.user)

        cellar_space = CellarSpace.objects.get_by_wine_id(wine.id)

        self.assertEqual(wine.id, cellar_space.wine_id)

    def test_get_or_create_empty_basket__case_get(self):
        cellar = CellarFactory()
        _wine_in_another_basket = WineInBasketFactory(cellar=cellar, user=cellar.user)
        basket = CellarSpace.objects.create(cellar=cellar, type=CellarSpaceType.BASKET)

        result = CellarSpace.objects.get_or_create_empty_basket(cellar.id)

        self.assertEqual(basket.id, result.id)

    def test_get_or_create_empty_basket__case_create(self):
        cellar = CellarFactory()
        _wine_in_another_basket = WineInBasketFactory(cellar=cellar, user=cellar.user)
        original_space_count = cellar.cellarspace_set.count()

        result = CellarSpace.objects.get_or_create_empty_basket(cellar.id)

        self.assertEqual(CellarSpaceType.BASKET, result.type)
        self.assertEqual(cellar.cellarspace_set.count(), original_space_count + 1)

    def test_filter_by_type(self):
        cellar = CellarFactory()
        _basket = CellarSpaceFactory(cellar=cellar, type=CellarSpaceType.BASKET)

        result = CellarSpace.objects.filter_by_type(CellarSpaceType.RACK)

        for space in result:
            self.assertEqual(CellarSpaceType.RACK, space.type)

    def test_filter_empty(self):
        cellar = CellarFactory()
        _wine = WineInRackFactory(cellar=cellar, row=1, column=1, user=cellar.user)

        result = CellarSpace.objects.filter_empty()

        for space in result:
            self.assertIsNone(space.wine)

    def test_order_by_position(self):
        _cellar = CellarFactory()

        result = CellarSpace.objects.order_by("-row", "column").order_by_position()

        prev = None
        for space in result:
            position = f"{space.row}-{space.column}"

            if prev is not None:
                self.assertLess(prev, position)

            prev = position
