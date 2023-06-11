from django.test import TestCase

from llwinecellar.common.test_utils import UserFactory
from user_preferences.models import UserPreference


class TestCellarModel(TestCase):
    def test_get_by_id(self):
        user_preference = UserFactory().userpreference

        result = UserPreference.objects.get_by_id(user_preference.id)

        self.assertEqual(result, user_preference)
