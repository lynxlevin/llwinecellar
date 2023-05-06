from django.test import TestCase
from cellars.models import Cellar, CellarSpace
from cellars.enums import CellarSpaceType
from llwinecellar.common.test_utils import factory, TestSeed


class TestCellarModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        cellar = factory.create_cellar({"user": self.seeds.users[0]})

        result = Cellar.objects.get_by_id(cellar.id)

        self.assertEqual(result, cellar)

    def test_create__cellar_spaces_are_created(self):
        cellar = factory.create_cellar(
            {"layout": [4, 5, 6, 6, 6, 6], "user": self.seeds.users[0]}
        )
        cellar_spaces = CellarSpace.objects.filter(cellar=cellar).order_by(
            "row", "column"
        )

        total_capacity = sum(cellar.layout)
        self.assertEqual(total_capacity, len(cellar_spaces))

        cellar_spaces = cellar_spaces.iterator()
        for index, capacity in enumerate(cellar.layout):
            row = index + 1
            for column in range(1, capacity + 1):
                cellar_space = next(cellar_spaces)
                self.assertEqual(row, cellar_space.row)
                self.assertEqual(column, cellar_space.column)
                self.assertEqual(CellarSpaceType.RACK, cellar_space.type)
