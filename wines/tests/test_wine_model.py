from django.test import TestCase
from wines.models import Wine
from llwinecellar.common.test_utils.test_seeds import TestSeed


class TestWineModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        wine = self.seeds.wines[0]

        result = Wine.objects.get_by_id(wine.id)

        self.assertEqual(result, wine)
