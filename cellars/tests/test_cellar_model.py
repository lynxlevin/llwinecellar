from django.test import TestCase

from cellars.enums import CellarSpaceType
from cellars.models import Cellar, CellarSpace
from llwinecellar.common.test_utils import TestSeed, factory


class TestCellarModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.user = cls.seeds.users[0]

    def test_create(self):
        cellar = factory.create_cellar({"layout": [5, 6, 6, 6, 6], "user": self.user})

        self._assert_cellar_spaces_created_for_each_row_and_column(cellar)

    def test_get_by_id(self):
        cellar = factory.create_cellar({"user": self.user})

        result = Cellar.objects.get_by_id(cellar.id)

        self.assertEqual(result, cellar)

    def test_filter_eq_user_id(self):
        cellar = factory.create_cellar({"user": self.user})
        _cellar_different_user = factory.create_cellar({"user": self.seeds.users[1]})

        result = Cellar.objects.filter_eq_user_id(self.user.id)

        self.assertEqual(1, result.count())
        self.assertEqual(cellar.id, result.all()[0].id)

    def test_order_by_created_at__asc(self):
        cellar_1 = factory.create_cellar({"user": self.user})
        cellar_2 = factory.create_cellar({"user": self.user})

        result = Cellar.objects.order_by_created_at().all()

        self.assertEqual(cellar_1.id, result[0].id)
        self.assertEqual(cellar_2.id, result[1].id)

    def test_order_by_created_at__desc(self):
        cellar_1 = factory.create_cellar({"user": self.user})
        cellar_2 = factory.create_cellar({"user": self.user})

        result = Cellar.objects.order_by_created_at(desc=True).all()

        self.assertEqual(cellar_2.id, result[0].id)
        self.assertEqual(cellar_1.id, result[1].id)

    """
    Utility Functions
    """

    def _assert_cellar_spaces_created_for_each_row_and_column(self, cellar: Cellar):
        cellar_spaces = CellarSpace.objects.filter(cellar=cellar).order_by("row", "column")

        total_capacity = sum(cellar.layout)
        self.assertEqual(total_capacity, cellar_spaces.count())

        cellar_spaces = cellar_spaces.iterator()
        for index, capacity in enumerate(cellar.layout):
            row = index + 1
            for column in range(1, capacity + 1):
                cellar_space = next(cellar_spaces)
                self.assertEqual(cellar.id, cellar_space.cellar_id)
                self.assertEqual(row, cellar_space.row)
                self.assertEqual(column, cellar_space.column)
                self.assertEqual(CellarSpaceType.RACK, cellar_space.type)
