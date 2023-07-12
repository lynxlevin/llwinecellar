from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import UserFactory


class TestUserPreferenceViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/user_preferences/"

    def test_get(self):
        # Arrange
        user = UserFactory()
        _another_user = UserFactory()

        # Act
        status_code, body = self._make_request(self.base_path, user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        user_preference = body["user_preference"]

        self.assertListEqual(user_preference["drink_whens"], user.userpreference.drink_whens)

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())
