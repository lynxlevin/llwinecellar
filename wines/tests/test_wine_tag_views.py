import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import UserFactory, WineTagFactory

logger = logging.getLogger(__name__)


class TestWineTagViews(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wine_tags/"
        cls.user = UserFactory()

    def test_list(self):
        # Arrange
        tags = WineTagFactory.create_batch(10, user=self.user)

        # Act
        status_code, body = self._make_request(self.base_path, self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "tag_texts": [tag.text for tag in tags],
        }
        self.assertEqual(expected, body)

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())
