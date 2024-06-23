import logging
from decimal import Decimal

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CellarFactory, UserFactory, WineInRackFactory

from ...enums import Country
from ...models import Wine

logger = logging.getLogger(__name__)


class TestCreateWine(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wines/"
        cls.user = UserFactory()

        cls.default_params = {
            "name": "Gevrey Chambertin",
            "producer": "Domaine Charlopin Tissier",
            "country": Country.FRANCE.label,
            "region_1": "Bourgogne",
            "region_2": "Côtes de Nuits",
            "region_3": "Gevrey Chambertin",
            "region_4": "",
            "region_5": "",
            "cepages": [
                {"name": "Cabernet Sauvignon", "abbreviation": "CS", "percentage": "60.0"},
                {"name": "Merlot", "abbreviation": "", "percentage": "35.0"},
                {"name": "Cabernet Franc", "abbreviation": "CF", "percentage": None},
            ],
            "vintage": 2019,
            "bought_at": "2023-05-07",
            "bought_from": "伊勢屋",
            "price": 13000,
            "drunk_at": None,
            "note": "テスト用のノート",
            "tag_texts": ["drink_soon", "birthday_present"],
            "value": 50,
        }

    def test_create(self):
        """
        Post /api/wines/
        """
        # Arrange
        params = self.default_params

        # Act
        status_code, body = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        self._assert_dict_contains_subset(params, body)

        # Assert wine
        wine = Wine.objects.get_by_id(body["id"])
        self.assertEqual(params["name"], wine.name)
        self.assertEqual(params["producer"], wine.producer)
        self.assertEqual(params["country"], wine.country.label)
        self.assertEqual(params["region_1"], wine.region_1)
        self.assertEqual(params["region_2"], wine.region_2)
        self.assertEqual(params["region_3"], wine.region_3)
        self.assertEqual(params["region_4"], wine.region_4)
        self.assertEqual(params["region_5"], wine.region_5)
        for param_cepage, wine_cepage in zip(params["cepages"], wine.cepages.all()):
            self.assertEqual(param_cepage["name"], wine_cepage.name)
            self.assertEqual(param_cepage["abbreviation"], wine_cepage.abbreviation)
            param_percentage = Decimal(param_cepage["percentage"]) if param_cepage["percentage"] else None
            self.assertEqual(param_percentage, wine_cepage.percentage)
        self.assertEqual(params["vintage"], wine.vintage)
        self.assertEqual(params["bought_at"], wine.bought_at.strftime("%Y-%m-%d"))
        self.assertEqual(params["bought_from"], wine.bought_from)
        self.assertEqual(params["price"], wine.price)
        self.assertEqual(params["drunk_at"], wine.drunk_at)
        self.assertEqual(params["note"], wine.note)
        self.assertEqual(params["tag_texts"], wine.tag_texts)
        self.assertEqual(params["value"], wine.value)

    def test_empty_params(self):
        """
        Post /api/wines/
        """
        # Arrange
        params = {
            "name": "required",
            "producer": "",
            "country": None,
            "region_1": "",
            "region_2": "",
            "region_3": "",
            "region_4": "",
            "region_5": "",
            "cepages": [],
            "vintage": None,
            "bought_at": None,
            "bought_from": "",
            "price": None,
            "drunk_at": None,
            "note": "",
            "tag_texts": [],
            "value": None,
        }

        # Act
        status_code, body = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        self._assert_dict_contains_subset(params, body)

        # Assert wine
        wine = Wine.objects.get_by_id(body["id"])
        self.assertEqual(params["name"], wine.name)
        self.assertEqual(params["producer"], wine.producer)
        self.assertEqual(params["country"], wine.country)
        self.assertEqual(params["region_1"], wine.region_1)
        self.assertEqual(params["region_2"], wine.region_2)
        self.assertEqual(params["region_3"], wine.region_3)
        self.assertEqual(params["region_4"], wine.region_4)
        self.assertEqual(params["region_5"], wine.region_5)
        self.assertEqual(params["cepages"], list(wine.cepages.all()))
        self.assertEqual(params["vintage"], wine.vintage)
        self.assertEqual(params["bought_at"], wine.bought_at)
        self.assertEqual(params["bought_from"], wine.bought_from)
        self.assertEqual(params["price"], wine.price)
        self.assertEqual(params["drunk_at"], wine.drunk_at)
        self.assertEqual(params["note"], wine.note)
        self.assertEqual(params["tag_texts"], wine.tag_texts)
        self.assertEqual(params["value"], wine.value)

    def test_create__to_empty_rack(self):
        # Arrange
        cellar = CellarFactory(user=self.user)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "1-1",
        }

        # Act
        status_code, body = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        self._assert_dict_contains_subset(params, body)

        # Assert wine
        wine = Wine.objects.get_by_id(body["id"])
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual(params["position"], wine.position)

    def test_create__to_empty_basket(self):
        # Arrange
        cellar = CellarFactory(user=self.user)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "basket",
        }

        # Act
        status_code, body = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        self._assert_dict_contains_subset(params, body)

        # Assert wine
        wine = Wine.objects.get_by_id(body["id"])
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual(params["position"], wine.position)

    def test_create__not_to_any_cellar(self):
        # Arrange
        params = {
            **self.default_params,
            "cellar_id": None,
        }

        # Act
        status_code, body = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        self._assert_dict_contains_subset(params, body)

        # Assert wine
        wine = Wine.objects.get_by_id(body["id"])
        self.assertEqual(None, wine.cellar_id)
        self.assertEqual(None, wine.position)

    def test_create__error_on_create_to_filled_rack__403(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        _another_wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "1-1",
        }

        # Act
        status_code, _ = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_403_FORBIDDEN, status_code)

        # Assert wine
        self.assertEqual(1, Wine.objects.count())

    def test_create__error_on_create_to_not_my_cellar__404(self):
        # Arrange
        not_my_cellar = CellarFactory()

        params = {
            **self.default_params,
            "cellar_id": str(not_my_cellar.id),
            "position": "1-1",
        }

        # Act
        status_code, _ = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        # Assert wine
        self.assertEqual(0, Wine.objects.count())

    def test_create__error_on_create_to_nonexistent_rack__404(self):
        # Arrange
        cellar = CellarFactory(user=self.user)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "999-999",
        }

        # Act
        status_code, _ = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        # Assert wine
        self.assertEqual(0, Wine.objects.count())

    def test_create__error_on_create_to_nonexistent_basket__404(self):
        # Arrange
        cellar = CellarFactory(user=self.user, has_basket=False)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "basket",
        }

        # Act
        status_code, _ = self._make_request(self.base_path, self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        # Assert wine
        self.assertEqual(0, Wine.objects.count())

    """
    Utility functions
    """

    def _make_request(self, path, user, params=None):
        client = Client()
        client.force_login(user)

        response = client.post(path, params, content_type="application/json")

        return (response.status_code, response.json())

    def _assert_dict_contains_subset(self, expected, actual):
        """
        https://stackoverflow.com/a/47473101
        """
        actual_subset = {k: v for k, v in actual.items() if k in expected}
        self.assertDictEqual(expected, actual_subset)
