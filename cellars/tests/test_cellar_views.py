from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import TestSeed, factory

from ..models import Cellar


class TestCellarViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.user = cls.seeds.users[0]
        cls.base_path = "/api/cellars/"

    def test_list(self):
        """
        Get /api/cellars/
        """
        cellar_1 = factory.create_cellar({"user": self.user})
        cellar_2 = factory.create_cellar({"user": self.user})

        _cellar_for_different_user = factory.create_cellar(
            {"user": self.seeds.users[1]}
        )

        status_code, body = self._make_request("get", self.base_path, self.user)

        self.assertEqual(status.HTTP_200_OK, status_code)

        cellars = body["cellars"]
        self.assertEqual(2, len(cellars))

        self.assertEqual(str(cellar_1.id), cellars[0]["id"])
        self.assertEqual(cellar_1.name, cellars[0]["name"])
        self.assertEqual(cellar_1.layout, cellars[0]["layout"])
        self.assertEqual(cellar_1.has_basket, cellars[0]["has_basket"])

        self.assertEqual(str(cellar_2.id), cellars[1]["id"])
        self.assertEqual(cellar_2.name, cellars[1]["name"])
        self.assertEqual(cellar_2.layout, cellars[1]["layout"])
        self.assertEqual(cellar_2.has_basket, cellars[1]["has_basket"])

    def test_create(self):
        """
        Post /api/cellars/
        """
        params = {
            "name": "Forester",
            "layout": [5, 6, 6, 6, 6],
            "has_basket": True,
        }

        status_code, body = self._make_request(
            "post", self.base_path, self.user, params
        )

        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_cellar = Cellar.objects.get_by_id(body["id"])
        self.assertEqual(params["name"], created_cellar.name)
        self.assertEqual(params["layout"], created_cellar.layout)
        self.assertEqual(params["has_basket"], created_cellar.has_basket)
        self.assertEqual(self.user.id, created_cellar.user_id)

    """
    Utility functions
    """

    def _make_request(self, method, path, user, params=None):
        client = Client()
        client.force_login(user)

        if method == "get":
            response = client.get(path)
        elif method == "post":
            response = client.post(path, params, content_type="application/json")

        return (response.status_code, response.json())
