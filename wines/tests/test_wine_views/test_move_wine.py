import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CellarFactory, WineFactory, WineInBasketFactory, WineInRackFactory

logger = logging.getLogger(__name__)


class TestMoveWine(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wines/"

    def test_from_outside_into_rack(self):
        # Arrange
        cellar = CellarFactory()
        wine = WineFactory(user=cellar.user)
        params = {
            "cellar_id": str(cellar.id),
            "row": 1,
            "column": 1,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_rack(wine, cellar, params["row"], params["column"])

        expected = {"wines": [{"id": str(wine.id), **params}]}
        self.assertDictEqual(expected, body)

    def test_from_rack_to_empty_rack(self):
        """
        Move a wine to an empty rack.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineInRackFactory(user=cellar.user, row=1, column=1, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": 2,
            "column": 3,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_rack(wine, cellar, params["row"], params["column"])

        expected = {"wines": [{"id": str(wine.id), **params}]}
        self.assertDictEqual(expected, body)

    def test_from_rack_to_filled_rack(self):
        """
        Change wine's place with another wine in the cellar.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineInRackFactory(user=cellar.user, row=1, column=1, cellar=cellar)
        another_wine = WineInRackFactory(user=cellar.user, row=2, column=3, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": 2,
            "column": 3,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_rack(wine, cellar, params["row"], params["column"])
        self._assert_wine_in_rack(another_wine, cellar, 1, 1)

        expected = {
            "wines": [
                {"id": str(wine.id), **params},
                {"id": str(another_wine.id), "cellar_id": str(cellar.id), "row": 1, "column": 1},
            ]
        }
        self.assertDictEqual(expected, body)

    def test_from_rack_to_basket(self):
        """
        Move a wine to a basket.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineInRackFactory(user=cellar.user, row=1, column=1, cellar=cellar)
        _another_wine = WineInBasketFactory(user=cellar.user, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": None,
            "column": None,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_basket(wine, cellar)

        expected = {"wines": [{"id": str(wine.id), **params}]}
        self.assertDictEqual(expected, body)

    def test_from_rack_to_outside(self):
        """
        Move a wine out from cellar.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineInRackFactory(user=cellar.user, row=1, column=1, cellar=cellar)
        params = {
            "cellar_id": None,
            "row": None,
            "column": None,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_not_wine_in_cellar(wine)

        expected = {"wines": [{"id": str(wine.id), **params}]}
        self.assertDictEqual(expected, body)

    def test_from_outside_to_filled_rack(self):
        """
        Place a wine into a filled rack and take out the one already in the rack.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineFactory(user=cellar.user)
        another_wine = WineInRackFactory(user=cellar.user, row=2, column=3, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": 2,
            "column": 3,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_rack(wine, cellar, params["row"], params["column"])
        self._assert_not_wine_in_cellar(another_wine)

        expected = {
            "wines": [
                {"id": str(wine.id), **params},
                {"id": str(another_wine.id), "cellar_id": None, "row": None, "column": None},
            ]
        }
        self.assertDictEqual(expected, body)

    def test_from_basket_to_empty_rack(self):
        # Arrange
        cellar = CellarFactory()
        wine = WineInBasketFactory(user=cellar.user, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": 2,
            "column": 3,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_rack(wine, cellar, params["row"], params["column"])

        expected = {"wines": [{"id": str(wine.id), **params}]}
        self.assertDictEqual(expected, body)

    def test_from_basket_to_filled_rack(self):
        # Arrange
        cellar = CellarFactory()
        wine = WineInBasketFactory(user=cellar.user, cellar=cellar)
        another_wine = WineInRackFactory(user=cellar.user, row=2, column=3, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": 2,
            "column": 3,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_rack(wine, cellar, params["row"], params["column"])
        self._assert_wine_in_basket(another_wine, cellar)

        expected = {
            "wines": [
                {"id": str(wine.id), **params},
                {"id": str(another_wine.id), "cellar_id": str(cellar.id), "row": None, "column": None},
            ]
        }
        self.assertDictEqual(expected, body)

    def test_from_basket_to_basket(self):
        """
        Place a wine into a filled rack and take out the one already in the rack.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineInBasketFactory(user=cellar.user, cellar=cellar)
        params = {
            "cellar_id": str(cellar.id),
            "row": None,
            "column": None,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_wine_in_basket(wine, cellar)

        expected = {"wines": []}
        self.assertDictEqual(expected, body)

    def test_from_basket_to_outside(self):
        # Arrange
        cellar = CellarFactory()
        wine = WineInBasketFactory(user=cellar.user, cellar=cellar)
        params = {
            "cellar_id": None,
            "row": None,
            "column": None,
        }

        # Act
        status_code, body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self._assert_not_wine_in_cellar(wine)

        expected = {"wines": [{"id": str(wine.id), **params}]}
        self.assertDictEqual(expected, body)

    def test_not_my_cellar__404(self):
        # Arrange
        cellar = CellarFactory()
        different_cellar = CellarFactory()
        wine = WineFactory(user=cellar.user)
        params = {
            "cellar_id": str(different_cellar.id),
            "row": 1,
            "column": 1,
        }

        # Act
        status_code, _body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

    def test_not_my_wine__404(self):
        # Arrange
        cellar = CellarFactory()
        wine = WineFactory()
        params = {
            "cellar_id": str(cellar.id),
            "row": 1,
            "column": 1,
        }

        # Act
        status_code, _body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

    def test_to_rack_non_existent__404(self):
        # Arrange
        cellar = CellarFactory()
        wine = WineFactory(user=cellar.user)
        params = {
            "cellar_id": str(cellar.id),
            "row": 999,
            "column": 999,
        }

        # Act
        status_code, _body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

    def test_to_basket_non_existent__404(self):
        # Arrange
        cellar = CellarFactory(has_basket=False)
        wine = WineFactory(user=cellar.user)
        params = {
            "cellar_id": str(cellar.id),
            "row": None,
            "column": None,
        }

        # Act
        status_code, _body = self._make_put_request(f"{self.base_path}{str(wine.id)}/space/", cellar.user, params)

        # Assert
        self.assertEqual(status.HTTP_404_NOT_FOUND, status_code)

    """
    Utility functions
    """

    def _make_put_request(self, path, user, params):
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

    def _assert_wine_in_rack(self, wine, cellar, row, column):
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual(row, wine.row)
        self.assertEqual(column, wine.column)

    def _assert_wine_in_basket(self, wine, cellar):
        wine.refresh_from_db()
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertIsNone(wine.row)
        self.assertIsNone(wine.column)

    def _assert_not_wine_in_cellar(self, wine):
        wine.refresh_from_db()
        self.assertIsNone(wine.cellar_id)
        self.assertIsNone(wine.row)
        self.assertIsNone(wine.column)
