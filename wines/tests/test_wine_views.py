from datetime import datetime

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import TestSeed, factory

from ..enums import Country
from ..models import Wine


class TestWineViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.base_path = "/api/wines/"
        cls.user = cls.seeds.users[0]
        cls.preference = cls.seeds.user_preferences[0]
        cls.cellar = factory.create_cellar({"user": cls.user, "layout": [5]})
        cls.wines_in_cellar = [
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "test_wine_1",
                    "position": "1-1",
                    "cellar_id": cls.cellar.id,
                }
            ),
            factory.create_wine(
                {
                    "user": cls.user,
                    "name": "test_wine_2",
                    "position": "1-2",
                    "cellar_id": cls.cellar.id,
                }
            ),
        ]
        cls.wines_not_in_cellar = [
            factory.create_wine({"user": cls.user, "name": "test_wine_3"}),
            factory.create_wine({"user": cls.user, "name": "test_wine_4"}),
        ]
        cls.wine_different_user = factory.create_wine(
            {"user": cls.seeds.users[1], "name": "different_user's_wine"}
        )

    def test_list__all(self):
        """
        Get /api/wines/
        """
        status_code, body = self._make_request("get", self.base_path, self.user)

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected_wines = [*self.wines_in_cellar, *self.wines_not_in_cellar]

        self.assertEqual(len(expected_wines), len(body["wines"]))

        for index, wine in enumerate(expected_wines):
            self.assertEqual(wine.name, body["wines"][index]["name"])

    def test_list__cellar(self):
        """
        Get /api/wines/?cellar_id={cellar_id}
        """

        status_code, body = self._make_request(
            "get", self.base_path, self.user, query=f"cellar_id={self.cellar.id}"
        )

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected_wines = self.wines_in_cellar

        self.assertEqual(len(expected_wines), len(body["wines"]))

        for index, wine in enumerate(expected_wines):
            self.assertEqual(wine.name, body["wines"][index]["name"])

    def test_list__filter_drunk(self):
        """
        Get /api/wines/?filter_drunk=true
        """

    def test_list__in_cellars_false(self):
        """
        Get /api/wines/?in_cellars=false
        """

    def test_list__no_record__both_cellar_and_in_cellars_false(self):
        """
        Get /api/wines/?cellar_id={cellar_id}&in_cellars=false
        """

    def test_create(self):
        """
        Post /api/wines/
        """
        params = {
            "drink_when": self.preference.drink_whens[0],
            "name": "Gevrey Chambertin",
            "producer": "Domaine Charlopin Tissier",
            "country": Country.FRANCE,
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

        status_code, body = self._make_request(
            "post", self.base_path, self.user, params=params
        )

        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_wine = Wine.objects.get_by_id(body["id"])
        self._assert_wine_created_according_to_params(params, created_wine)

    def test_create__empty_params(self):
        """
        Post /api/wines/
        """
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

        status_code, body = self._make_request(
            "post", self.base_path, self.user, params=params
        )

        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_wine = Wine.objects.get_by_id(body["id"])
        self._assert_wine_created_according_to_params(params, created_wine)

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

        return (response.status_code, response.json())

    def _assert_wine_created_according_to_params(self, params, wine):
        def assert_date_equals(param, wine_field):
            if param:
                self.assertEqual(
                    datetime.strptime(param, "%Y-%m-%d").date(), wine_field
                )
            else:
                self.assertIsNone(wine_field)

        self.assertEqual(params["drink_when"], wine.drink_when)
        self.assertEqual(params["name"], wine.name)
        self.assertEqual(params["producer"], wine.producer)
        self.assertEqual(params["country"], wine.country)
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
        assert_date_equals(params["bought_at"], wine.bought_at)
        assert_date_equals(params["drunk_at"], wine.drunk_at)
