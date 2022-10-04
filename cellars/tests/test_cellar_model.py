from django.test import TestCase
from cellars.models import Cellar
from llwinecellar.common.test_utils.test_seeds import TestSeed


class TestCellarModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        cellar = self.seeds.cellars[0]

        result = Cellar.objects.get_by_id(cellar.id)

        self.assertEqual(result, cellar)
