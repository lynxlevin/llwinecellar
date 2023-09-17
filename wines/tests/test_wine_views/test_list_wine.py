import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CellarFactory, DrunkWineFactory, UserFactory, WineFactory, WineInRackFactory

logger = logging.getLogger(__name__)


class TestListWine(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wines/"
        cls.user = UserFactory()
        cls.cellar = CellarFactory(user=cls.user)
        # MYMEMO(後日): add cepages and tag

        cls.empty_rack = {
            "name": "",
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
            "price_with_tax": None,
            "drunk_at": None,
            "note": "",
            "tag_texts": [],
        }

    def test_all(self):
        # Arrange
        wines_in_cellar = [WineInRackFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        wines_not_in_cellar = [WineFactory(user=self.user)]
        wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request(self.base_path, self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [*wines_in_cellar, *wines_not_in_cellar, *wines_drunk]
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    def test_cellar(self):
        # Arrange
        wines_in_cellar = [WineInRackFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        _wines_not_in_cellar = [WineFactory(user=self.user)]
        _wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request(f"{self.base_path}?cellar_id={self.cellar.id}", self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [
            *wines_in_cellar,
            *[
                {
                    **self.empty_rack,
                    "cellar_id": str(self.cellar.id),
                    "position": f"1-{column}",
                }
                for column in range(2, 6)
            ],
            *[
                {
                    **self.empty_rack,
                    "cellar_id": str(self.cellar.id),
                    "position": f"2-{column}",
                }
                for column in range(1, 7)
            ],
            *[
                {
                    **self.empty_rack,
                    "cellar_id": str(self.cellar.id),
                    "position": f"3-{column}",
                }
                for column in range(1, 7)
            ],
        ]
        self._assert_listed_wines_equal_expected([expected[0]], [body["wines"][0]])
        for expected_wine, wine_response in zip(expected[1:], body["wines"][1:]):
            wine_response.pop("id")
            self.assertDictEqual(expected_wine, wine_response)

    def test_is_drunk(self):
        # Arrange
        _wines_in_cellar = [WineInRackFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        _wines_not_in_cellar = [WineFactory(user=self.user)]
        wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request(f"{self.base_path}?is_drunk=true", self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = wines_drunk
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    def test_out_of_cellars(self):
        # Arrange
        _wines_in_cellar = [WineInRackFactory(row=1, column=1, cellar=self.cellar, user=self.user)]
        wines_not_in_cellar = [WineFactory(user=self.user)]
        wines_drunk = [DrunkWineFactory(user=self.user)]
        _wines_different_user = [WineFactory()]

        # Act
        status_code, body = self._make_request(f"{self.base_path}?out_of_cellars=true", self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [*wines_not_in_cellar, *wines_drunk]
        self._assert_listed_wines_equal_expected(expected, body["wines"])

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())

    def _assert_listed_wines_equal_expected(self, expected_wines, listed_wines):
        self.assertEqual(len(expected_wines), len(listed_wines))

        for expected, listed in zip(expected_wines, listed_wines):
            dict = {
                "id": str(expected.id),
                "name": expected.name,
                "producer": expected.producer,
                "country": expected.country.label,
                "region_1": expected.region_1,
                "region_2": expected.region_2,
                "region_3": expected.region_3,
                "region_4": expected.region_4,
                "region_5": expected.region_5,
                "cepages": list(expected.cepages.all()),
                "vintage": expected.vintage,
                "bought_at": expected.bought_at.strftime("%Y-%m-%d") if expected.bought_at is not None else None,
                "bought_from": expected.bought_from,
                "price_with_tax": expected.price_with_tax,
                "drunk_at": expected.drunk_at.strftime("%Y-%m-%d") if expected.drunk_at is not None else None,
                "note": expected.note,
                "cellar_id": str(expected.cellar_id) if expected.cellar_id else None,
                "position": expected.position,
                "tag_texts": expected.tag_texts,
            }
            self.assertDictEqual(dict, listed)
