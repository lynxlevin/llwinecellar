import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CepageFactory, GrapeMasterFactory, UserFactory, WineFactory

from ..models import Cepage, GrapeMaster, Wine

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

    def test_delete(self):
        # Arrange
        grape_to_delete = GrapeMasterFactory(user=self.user)

        # Act
        client = self._get_client(self.user)
        response = client.delete(f"{self.base_path}{grape_to_delete.id}/", content_type="application/json")

        # Assert
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

        self.assertEqual(0, GrapeMaster.objects.count())
        self.assertIsNone(GrapeMaster.objects.get_by_id(grape_to_delete.id))

    def test_delete_cannot_delete_different_users_grape(self):
        # Arrange
        other_user_grape = GrapeMasterFactory()

        # Act
        client = self._get_client(self.user)
        response = client.delete(f"{self.base_path}{other_user_grape.id}/", content_type="application/json")

        # Assert
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

        self.assertEqual(1, GrapeMaster.objects.count())
        self.assertIsNotNone(GrapeMaster.objects.get_by_id(other_user_grape.id))

    def test_delete_returns_alert_message_when_it_is_assigned_to_a_wine(self):
        # Arrange
        assigned_grape = GrapeMasterFactory(user=self.user)
        wine = WineFactory(user=self.user)
        _cepage = CepageFactory(wine=wine, grape=assigned_grape)

        # Act
        client = self._get_client(self.user)
        response = client.delete(f"{self.base_path}{assigned_grape.id}/", content_type="application/json")

        # Assert
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        self.assertEqual(1, GrapeMaster.objects.count())
        self.assertIsNotNone(GrapeMaster.objects.get_by_id(assigned_grape.id))

    def test_delete_with_force_delete_query_grape_assigned_to_a_wine_can_be_deleted(self):
        # Arrange
        assigned_grape = GrapeMasterFactory(user=self.user)
        wine = WineFactory(user=self.user)
        cepage = CepageFactory(wine=wine, grape=assigned_grape)

        # Act
        client = self._get_client(self.user)
        response = client.delete(
            f"{self.base_path}{assigned_grape.id}/?force_delete=true", content_type="application/json"
        )

        # Assert
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

        # grape_master and cepage should be deleted
        self.assertEqual(0, GrapeMaster.objects.count())
        self.assertIsNone(GrapeMaster.objects.get_by_id(assigned_grape.id))
        self.assertEqual(0, Cepage.objects.count())
        self.assertIsNone(Cepage.objects.get_by_id(cepage.id))
        # wine should not be deleted
        self.assertEqual(1, Wine.objects.count())
        self.assertIsNotNone(Wine.objects.get_by_id(wine.id))

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
