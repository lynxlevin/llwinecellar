from django.test import TestCase

from llwinecellar.common.test_utils import TestSeed
from user_preferences.models import UserPreference


class TestCellarModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        user_preference = self.seeds.user_preferences[0]

        result = UserPreference.objects.get_by_id(user_preference.id)

        self.assertEqual(result, user_preference)
