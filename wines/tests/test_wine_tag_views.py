import logging
import uuid

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import UserFactory, WineTagFactory

from ..models import WineTag

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

        tags.sort(key=lambda tag: tag.text)
        expected = {
            "tag_texts": [tag.text for tag in tags],
        }
        self.assertEqual(expected, body)

    def test_delete(self):
        # Arrange
        tags = WineTagFactory.create_batch(10, user=self.user)
        tag_to_delete = tags[0]
        client = self._get_client(self.user)

        params = {"tag_text": tag_to_delete.text}

        # Act
        response = client.delete(self.base_path, params, content_type="application/json")

        # Assert
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

        self.assertEqual(9, WineTag.objects.count())
        self.assertIsNone(WineTag.objects.get_by_id(tag_to_delete.id))

    def test_delete__not_my_tag__404(self):
        # Arrange
        tags = WineTagFactory.create_batch(10)
        tag_to_delete = tags[0]
        client = self._get_client(self.user)

        params = {"tag_text": tag_to_delete.text}

        # Act
        response = client.delete(self.base_path, params, content_type="application/json")

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

        self.assertEqual(10, WineTag.objects.count())
        self.assertIsNotNone(WineTag.objects.get_by_id(tag_to_delete.id))

    def test_delete__non_existent_tag__404(self):
        # Arrange
        _tags = WineTagFactory.create_batch(10)
        client = self._get_client(self.user)

        params = {"tag_text": "non_existent_tag"}

        # Act
        response = client.delete(self.base_path, params, content_type="application/json")

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

        self.assertEqual(10, WineTag.objects.count())

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())

    def _get_client(self, user):
        client = Client()
        client.force_login(user)

        return client
