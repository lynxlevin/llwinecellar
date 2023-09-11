import logging
from decimal import Decimal

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import (
    CellarFactory,
    CepageFactory,
    GrapeMasterFactory,
    UserFactory,
    WineFactory,
    WineInBasketFactory,
    WineInRackFactory,
    WineTagFactory,
)

from ...enums import Country

logger = logging.getLogger(__name__)


class TestUpdateWine(TestCase):
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
            "cepages": [{"name": "Pinot Noir", "abbreviation": "PN", "percentage": "100.0"}],
            "vintage": 2019,
            "bought_at": "2023-05-07",
            "bought_from": "伊勢屋",
            "price_with_tax": 13000,
            "drunk_at": None,
            "note": "テスト用のノート",
            "tag_texts": ["updated_tag1", "updated_tag2"],
        }

    def test_update(self):
        # Arrange
        wine = WineFactory(user=self.user)
        params = self.default_params

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
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
        self.assertEqual(params["price_with_tax"], wine.price_with_tax)
        self.assertEqual(params["drunk_at"], wine.drunk_at)
        self.assertEqual(params["note"], wine.note)
        for param_tag, wine_tag in zip(params["tag_texts"], wine.tags.all()):
            self.assertEqual(param_tag, wine_tag.text)

    def test_update__same_result_on_multiple_requests(self):
        # Arrange
        wine = WineFactory(user=self.user)
        params = self.default_params

        # Act twice
        self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
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
        self.assertEqual(params["price_with_tax"], wine.price_with_tax)
        self.assertEqual(params["drunk_at"], wine.drunk_at)
        self.assertEqual(params["note"], wine.note)
        for param_tag, wine_tag in zip(params["tag_texts"], wine.tags.all()):
            self.assertEqual(param_tag, wine_tag.text)

    def test_update__empty_cepages(self):
        # Arrange
        wine = WineFactory(user=self.user)
        grape_master = GrapeMasterFactory(user=self.user)
        CepageFactory(wine=wine, grape=grape_master, percentage=100.0)

        params = {
            **self.default_params,
            "cepages": [],
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine.cepages
        wine.refresh_from_db()
        self.assertEqual(0, wine.cepages.count())

    def test_update__empty_tag_texts(self):
        # Arrange
        wine = WineFactory(user=self.user)
        tags = WineTagFactory.create_batch(2, user=self.user)
        wine.tags.set(tags)

        params = {
            **self.default_params,
            "tag_texts": [],
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
        self.assertEqual(0, wine.tags.count())

    def test_update__move_to_empty_rack(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "1-2",
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual(params["position"], wine.position)

    def test_update__move_to_empty_basket(self):
        # Arrange
        wine = WineFactory(user=self.user)
        cellar = CellarFactory(user=self.user)
        _another_wine = WineInBasketFactory(user=self.user, cellar=cellar)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "basket",
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual(params["position"], wine.position)

    def test_update__move_to_outside_of_cellar(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)

        params = {
            **self.default_params,
            "cellar_id": None,
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
        self.assertEqual(None, wine.cellar_id)
        self.assertEqual(None, wine.position)

    def test_update__do_not_move_when_cellar_id_is_not_in_params(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)

        params = {
            **self.default_params,
        }

        # Act
        status_code, body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "id": str(wine.id),
            **params,
        }
        self._assert_dict_contains_subset(expected, body)

        # Assert wine
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual("1-1", wine.position)

    def test_update__error_on_move_to_filled_rack__403(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)
        _another_wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=2)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "1-2",
        }

        # Act
        status_code, _body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_403_FORBIDDEN, status_code)

        # Assert wine not moved
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual("1-1", wine.position)

    def test_update__error_on_move_to_not_my_cellar__404(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)
        not_my_cellar = CellarFactory()

        params = {
            **self.default_params,
            "cellar_id": str(not_my_cellar.id),
            "position": "1-1",
        }

        # Act
        status_code, _body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        # Assert wine not moved
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual("1-1", wine.position)

    def test_update__error_on_move_to_nonexistent_rack__404(self):
        # Arrange
        cellar = CellarFactory(user=self.user)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "999-999",
        }

        # Act
        status_code, _body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        # Assert wine not moved
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual("1-1", wine.position)

    def test_update__error_on_move_to_nonexistent_basket__404(self):
        # Arrange
        cellar = CellarFactory(user=self.user, has_basket=False)
        wine = WineInRackFactory(user=self.user, cellar=cellar, row=1, column=1)

        params = {
            **self.default_params,
            "cellar_id": str(cellar.id),
            "position": "basket",
        }

        # Act
        status_code, _body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        # Assert wine not moved
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual("1-1", wine.position)

    def test_not_my_wine__404(self):
        # Arrange
        wine = WineFactory()
        params = self.default_params

        # Act
        status_code, _body = self._make_request(f"{self.base_path}{str(wine.id)}/", self.user, params=params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

        self._assert_wine_is_not_updated(wine)

    """
    Utility functions
    """

    def _make_request(self, path, user, params=None):
        client = Client()
        client.force_login(user)

        response = client.put(path, params, content_type="application/json")

        return (response.status_code, response.json())

    def _assert_dict_contains_subset(self, expected, actual):
        """
        https://stackoverflow.com/a/47473101
        """
        actual_subset = {k: v for k, v in actual.items() if k in expected}
        self.assertDictEqual(expected, actual_subset)

    def _assert_wine_is_not_updated(self, wine):
        original_wine_dict = wine.__dict__
        wine.refresh_from_db()
        self.assertDictEqual(original_wine_dict, wine.__dict__)
