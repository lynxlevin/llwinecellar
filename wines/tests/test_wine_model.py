from django.test import TestCase
from wines.models import Wine
from llwinecellar.common.test_utils import factory, TestSeed


class TestWineModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        wine = factory.create_wine({"user": self.seeds.users[0]})

        result = Wine.objects.get_by_id(wine.id)

        self.assertEqual(result, wine)