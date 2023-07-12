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

        # Act
        status_code, body = self._make_request("get", self.base_path, user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        user_preference = body["user_preference"]

        self.assertListEqual(user.userpreference.drink_whens, user_preference["drink_whens"])

    def test_create(self):
        # Arrange
        user = UserFactory(userpreference=None)

        params = {
            "user_preference": {
                "drink_whens": [
                    "1 year",
                    "2 years",
                    "3 years",
                ],
            },
        }

        # Act
        status_code, body = self._make_request("post", self.base_path, user, params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        user_preference = body["user_preference"]

        self.assertListEqual(params["user_preference"]["drink_whens"], user_preference["drink_whens"])

    """
    Utility functions
    """

    def _make_request(self, method, path, user, params=None):
        client = Client()
        client.force_login(user)

        if method == "get":
            response = client.get(path)
        if method == "post":
            response = client.post(path, params, content_type="application/json")

        return (response.status_code, response.json())
