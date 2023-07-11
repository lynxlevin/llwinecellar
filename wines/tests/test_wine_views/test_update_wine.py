import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CellarFactory, UserFactory, WineFactory

from ...enums import Country

logger = logging.getLogger(__name__)


class TestUpdateWine(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wines/"
        cls.user = UserFactory()
        cls.preference = cls.user.userpreference
        cls.cellar = CellarFactory(user=cls.user)

    def test_update(self):
        # Arrange
        wine = WineFactory(user=self.user)
        params = {
            "drink_when": self.preference.drink_whens[0],
            "name": "Gevrey Chambertin",
            "producer": "Domaine Charlopin Tissier",
            "country": Country.FRANCE.label,
            "region_1": "Bourgogne",
            "region_2": "Côtes de Nuits",
            "region_3": "Gevrey Chambertin",
            "region_4": "",
            "region_5": "",
            "cepage": [{"grape": "Pinot Noir", "percent": 100}],
            "vintage": 2019,
            "bought_at": "2023-05-07",
            "bought_from": "伊勢屋",
            "price_with_tax": 13000,
            "drunk_at": None,
            "note": "テスト用のノート",
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_is_same_as_params(params, wine)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

    def test_not_my_wine__404(self):
        # Arrange
        wine = WineFactory()
        params = {
            "drink_when": self.preference.drink_whens[0],
            "name": "Gevrey Chambertin",
            "producer": "Domaine Charlopin Tissier",
            "country": Country.FRANCE.label,
            "region_1": "Bourgogne",
            "region_2": "Côtes de Nuits",
            "region_3": "Gevrey Chambertin",
            "region_4": "",
            "region_5": "",
            "cepage": [{"grape": "Pinot Noir", "percent": 100}],
            "vintage": 2019,
            "bought_at": "2023-05-07",
            "bought_from": "伊勢屋",
            "price_with_tax": 13000,
            "drunk_at": None,
            "note": "テスト用のノート",
        }

        # Act
        status_code, _body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        original_wine_dict = wine.__dict__
        wine.refresh_from_db()
        self.assertDictEqual(original_wine_dict, wine.__dict__)

    """
    Utility functions
    """

    def _make_request(self, path, user, params=None):
        client = Client()
        client.force_login(user)

        response = client.put(path, params, content_type="application/json")

        return (response.status_code, response.json())

    def _assert_wine_is_same_as_params(self, params, wine):
        wine.refresh_from_db()

        self.assertEqual(params["drink_when"], wine.drink_when)
        self.assertEqual(params["name"], wine.name)
        self.assertEqual(params["producer"], wine.producer)
        self.assertEqual(params["region_1"], wine.region_1)
        self.assertEqual(params["region_2"], wine.region_2)
        self.assertEqual(params["region_3"], wine.region_3)
        self.assertEqual(params["region_4"], wine.region_4)
        self.assertEqual(params["region_5"], wine.region_5)
        self.assertEqual(params["cepage"], wine.cepage)
        self.assertEqual(params["vintage"], wine.vintage)
        self.assertEqual(params["bought_from"], wine.bought_from)
        self.assertEqual(params["price_with_tax"], wine.price_with_tax)
        self.assertEqual(params["note"], wine.note)

        if params["country"]:
            self.assertEqual(Country.from_label(params["country"]), wine.country)
        if params["bought_at"]:
            self.assertEqual(params["bought_at"], wine.bought_at.strftime("%Y-%m-%d"))
        if params["drunk_at"]:
            self.assertEqual(params["drunk_at"], wine.drunk_at.strftime("%Y-%m-%d"))

    def _assert_dict_contains_subset(self, expected, actual):
        """
        https://stackoverflow.com/a/47473101
        """
        actual_subset = {k: v for k, v in actual.items() if k in expected}
        self.assertDictEqual(expected, actual_subset)
