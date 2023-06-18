import logging
from datetime import datetime

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CellarFactory, DrunkWineFactory, PlacedWineFactory, UserFactory, WineFactory

from ..enums import Country
from ..models import Wine

logger = logging.getLogger(__name__)


class TestWineViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wines/"
        cls.user = UserFactory()
        cls.preference = cls.user.userpreference
        cls.cellar = CellarFactory(user=cls.user)

    def test_list__all(self):
        """
        Get /api/wines/
        """
        # Arrange
        wines_in_cellar = [PlacedWineFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        wines_not_in_cellar = [WineFactory(user=self.user)]
        wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request("get", self.base_path, self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [*wines_in_cellar, *wines_not_in_cellar, *wines_drunk]
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    def test_list__cellar(self):
        """
        Get /api/wines/?cellar_id={cellar_id}
        """
        # Arrange
        wines_in_cellar = [PlacedWineFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        _wines_not_in_cellar = [WineFactory(user=self.user)]
        _wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request("get", self.base_path, self.user, query=f"cellar_id={self.cellar.id}")

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = wines_in_cellar
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    def test_list__is_drunk(self):
        """
        Get /api/wines/?is_drunk=true
        """
        # Arrange
        _wines_in_cellar = [PlacedWineFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        _wines_not_in_cellar = [WineFactory(user=self.user)]
        wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request("get", self.base_path, self.user, query="is_drunk=true")

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = wines_drunk
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    def test_list__in_cellars_false(self):
        """
        Get /api/wines/?in_cellars=false
        """
        # Arrange
        _wines_in_cellar = [PlacedWineFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        wines_not_in_cellar = [WineFactory(user=self.user)]
        wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request("get", self.base_path, self.user, query="in_cellars=false")

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [*wines_not_in_cellar, *wines_drunk]
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    def test_create(self):
        """
        Post /api/wines/
        """
        # Arrange
        params = {
            "drink_when": self.preference.drink_whens[0],
            "name": "Gevrey Chambertin",
            "producer": "Domaine Charlopin Tissier",
            "country": Country.FRANCE.value,  # MYMEMO: change to "france"
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
        status_code, body = self._make_request("post", self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_wine = Wine.objects.get_by_id(body["id"])
        self._assert_wine_is_same_as_params(params, created_wine)

        self._assert_dict_contains_subset(params, body)

    def test_create__empty_params(self):
        """
        Post /api/wines/
        """
        # Arrange
        params = {
            "drink_when": "",
            "name": "",
            "producer": "",
            "country": None,
            "region_1": "",
            "region_2": "",
            "region_3": "",
            "region_4": "",
            "region_5": "",
            "cepage": [],
            "vintage": None,
            "bought_at": None,
            "bought_from": "",
            "price_with_tax": None,
            "drunk_at": None,
            "note": "",
        }

        # Act
        status_code, body = self._make_request("post", self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_wine = Wine.objects.get_by_id(body["id"])
        self._assert_wine_is_same_as_params(params, created_wine)

        self._assert_dict_contains_subset(params, body)

    def test_update(self):
        """
        Put /api/wines/{wine_id}
        """
        # Arrange
        wine = WineFactory()
        params = {
            "drink_when": self.preference.drink_whens[0],
            "name": "Gevrey Chambertin",
            "producer": "Domaine Charlopin Tissier",
            "country": Country.FRANCE.value,  # MYMEMO: change to "france"
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
        status_code, body = self._make_request("put", f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        wine.refresh_from_db()
        self._assert_wine_is_same_as_params(params, wine)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

    """
    Utility functions
    """

    def _make_request(self, method, path, user, params=None, query=None):
        client = Client()
        client.force_login(user)

        if method == "get":
            if query:
                path += f"?{query}"
            response = client.get(path)
        elif method == "post":
            response = client.post(path, params, content_type="application/json")
        elif method == "put":
            response = client.put(path, params, content_type="application/json")

        return (response.status_code, response.json())

    def _assert_listed_wines_equal_expected(self, expected, listed):
        self.assertEqual(len(expected), len(listed))

        # MYMEMO: refactor using zip
        for index, wine in enumerate(expected):
            self.assertEqual(wine.name, listed[index]["name"])
            if hasattr(wine, "cellarspace"):
                self.assertEqual(str(wine.cellarspace.cellar_id), listed[index]["cellar_id"])
                self.assertEqual(wine.cellarspace.row, listed[index]["row"])
                self.assertEqual(wine.cellarspace.column, listed[index]["column"])
            else:
                self.assertIsNone(listed[index]["cellar_id"])
                self.assertIsNone(listed[index]["row"])
                self.assertIsNone(listed[index]["column"])

    def _assert_wine_is_same_as_params(self, params, wine):
        dict = {
            **wine.__dict__,
            "bought_at": wine.bought_at.strftime("%Y-%m-%d") if wine.bought_at is not None else None,
            "drunk_at": wine.drunk_at.strftime("%Y-%m-%d") if wine.drunk_at is not None else None,
        }

        self._assert_dict_contains_subset(params, dict)

    def _assert_dict_contains_subset(self, expected, actual):
        """
        https://stackoverflow.com/a/47473101
        """
        actual_subset = {k: v for k, v in actual.items() if k in expected}
        self.assertDictEqual(expected, actual_subset)
