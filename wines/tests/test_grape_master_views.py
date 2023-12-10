import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import GrapeMasterFactory, UserFactory

from ..models import GrapeMaster

logger = logging.getLogger(__name__)


class TestGrapeMasterViews(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/grape_masters/"
        cls.user = UserFactory()

    def test_list(self):
        # Arrange
        grapes = [
            GrapeMasterFactory(name="Pinot Noir", abbreviation="PN", user=self.user),
            GrapeMasterFactory(name="Cabernet Sauvignon", abbreviation="CS", user=self.user),
            GrapeMasterFactory(name="Merlot", abbreviation="Mr", user=self.user),
            GrapeMasterFactory(name="Syrah", abbreviation=None, user=self.user),
        ]
        _different_user_grape = GrapeMasterFactory()

        # Act
        status_code, body = self._make_request(self.base_path, self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "grape_masters": [{"id": str(g.id), "name": g.name, "abbreviation": g.abbreviation} for g in grapes],
        }
        self.assertDictEqual(expected, body)

    def test_create(self):
        # Arrange
        params = {"name": "Cabernet Franc", "abbreviation": "CF"}

        # Act
        status_code, body = self._make_post_request(self.base_path, self.user, params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)
        id = body.pop("id")
        self.assertDictEqual(params, body)

        created_grape_master = GrapeMaster.objects.get_by_id(id)
        self.assertEqual(params["name"], created_grape_master.name)
        self.assertEqual(params["abbreviation"], created_grape_master.abbreviation)

    def test_duplicate_name_cannot_be_created(self):
        # Arrange
        existing_grape = GrapeMasterFactory(name="Pinot Noir", abbreviation="PN", user=self.user)
        params = {"name": existing_grape.name, "abbreviation": ""}

        # Act
        status_code, body = self._make_post_request(self.base_path, self.user, params)

        # Assert
        self.assertEqual(status.HTTP_400_BAD_REQUEST, status_code)
        self.assertEqual(1, GrapeMaster.objects.count())

    # def test_delete(self):
    #     # Arrange
    #     tags = WineTagFactory.create_batch(10, user=self.user)
    #     tag_to_delete = tags[0]
    #     client = self._get_client(self.user)

    #     params = {"tag_text": tag_to_delete.text}

    #     # Act
    #     response = client.delete(self.base_path, params, content_type="application/json")

    #     # Assert
    #     self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

    #     self.assertEqual(9, WineTag.objects.count())
    #     self.assertIsNone(WineTag.objects.get_by_id(tag_to_delete.id))

    # def test_delete__not_my_tag__404(self):
    #     # Arrange
    #     tags = WineTagFactory.create_batch(10)
    #     tag_to_delete = tags[0]
    #     client = self._get_client(self.user)

    #     params = {"tag_text": tag_to_delete.text}

    #     # Act
    #     response = client.delete(self.base_path, params, content_type="application/json")

    #     # Assert
    #     self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    #     self.assertEqual(10, WineTag.objects.count())
    #     self.assertIsNotNone(WineTag.objects.get_by_id(tag_to_delete.id))

    # def test_delete__non_existent_tag__404(self):
    #     # Arrange
    #     _tags = WineTagFactory.create_batch(10)
    #     client = self._get_client(self.user)

    #     params = {"tag_text": "non_existent_tag"}

    #     # Act
    #     response = client.delete(self.base_path, params, content_type="application/json")

    #     # Assert
    #     self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    #     self.assertEqual(10, WineTag.objects.count())

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())

    def _make_post_request(self, path, user, params):
        client = Client()
        client.force_login(user)

        response = client.post(path, params, content_type="application/json")

        return (response.status_code, response.json())

    def _get_client(self, user):
        client = Client()
        client.force_login(user)

        return client
