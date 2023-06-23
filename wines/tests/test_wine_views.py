import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import CellarFactory, DrunkWineFactory, PlacedWineFactory, UserFactory, WineFactory

from ..enums import Country
from ..models import Wine

logger = logging.getLogger(__name__)


class TestWineViews(TestCase):
    maxDiff = None

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

    def test_move_wine__from_outside(self):
        """
        Put /ai/wines/{wine_id}/space
        Place a new wine to a cellar space.
        """
        # Arrange
        cellar = CellarFactory()
        wine = WineFactory(user=cellar.user)
        params = {
            "cellar_id": str(cellar.id),
            "row": 1,
            "column": 1,
        }

        # Act
        status_code, body = self._make_request(
            "put", f"{self.base_path}{str(wine.id)}/space/", self.user, params=params
        )

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        wine = Wine.objects.select_cellarspace().get_by_id(wine.id)
        self.assertEqual(cellar.id, wine.cellar_id)
        self.assertEqual(params["row"], wine.row)
        self.assertEqual(params["column"], wine.column)

        expected = {
            "wines": [
                {
                    "id": str(wine.id),
                    **params,
                },
            ],
        }
        self.assertEqual(1, len(body))
        self._assert_dict_contains_subset(expected["wines"][0], body["wines"][0])

    # def test_move_wine__from_rack_to_empty_rack(self):
    #     """
    #     Put /ai/wines/{wine_id}/space
    #     Move a wine to an empty rack.
    #     """
    #     # Arrange
    #     cellar = CellarFactory()
    #     wine = PlacedWineFactory(user=cellar.user, row=1, column=1, cellar=cellar)
    #     params = {
    #             "cellar_id": str(cellar.id),
    #             "row": 2,
    #             "column": 3,
    #     }

    #     # Act
    #     status_code, body = self._make_request("put", f"{self.base_path}{str(wine.id)}/space/", self.user, params=params)

    #     # Assert
    #     self.assertEqual(status.HTTP_200_OK, status_code)

    #     wine = Wine.objects.select_cellarspace().get_by_id(wine.id)
    #     self.assertEqual(cellar.id, wine.cellar_id)
    #     self.assertEqual(params["row"], wine.row)
    #     self.assertEqual(params["column"], wine.column)

    #     expected = {
    # "wines": [
    #         {
    #             "id": str(wine.id),
    #             **params,
    #         }
    #     ]
    # }
    #     self.assertEqual(1, len(body))
    #     self._assert_dict_contains_subset(expected["wines"][0], body["wines"][0])

    # def test_move_wine__from_rack_to_filled_rack(self):
    #     """
    #     Put /ai/wines/{wine_id}/space
    #     Change wine's place with another wine in the cellar.
    #     """
    #     # Arrange
    #     cellar = CellarFactory()
    #     wine = PlacedWineFactory(user=cellar.user, row=1, column=1, cellar=cellar)
    #     another_wine = PlacedWineFactory(user=cellar.user, row=2, column=3, cellar=cellar)
    #     params = {
    #             "cellar_id": str(cellar.id),
    #             "row": 2,
    #             "column": 3,
    #     }

    #     # Act
    #     status_code, body = self._make_request("put", f"{self.base_path}{str(wine.id)}/space/", self.user, params=params)

    #     # Assert
    #     self.assertEqual(status.HTTP_200_OK, status_code)

    #     wine = Wine.objects.select_cellarspace().get_by_id(wine.id)
    #     self.assertEqual(cellar.id, wine.cellar_id)
    #     self.assertEqual(params["row"], wine.row)
    #     self.assertEqual(params["column"], wine.column)

    #     another_wine = Wine.objects.select_cellarspace().get_by_id(another_wine.id)
    #     self.assertEqual(cellar.id, another_wine.cellar_id)
    #     self.assertEqual(1, another_wine.row)
    #     self.assertEqual(1, another_wine.column)

    #     expected = {
    # "wines": [
    #         {
    #             "id": str(wine.id),
    #             **params,
    #         },
    #         {
    #             "id": str(another_wine.id),
    #             "cellar_id": str(cellar.id),
    #             "row": 1,
    #             "column": 1,
    #         },
    #     ]
    # }
    #     self.assertEqual(2, len(body))
    #     self._assert_dict_contains_subset(expected["wines"][0], body["wines"][0])
    #     self._assert_dict_contains_subset(expected["wines"][1], body["wines"][1])

    # def test_move_wine__from_rack_to_basket(self):
    #     """
    #     Put /ai/wines/{wine_id}/space
    #     Move a wine to a basket.
    #     """
    #     # Arrange
    #     cellar = CellarFactory()
    #     wine = PlacedWineFactory(user=cellar.user, row=1, column=1, cellar=cellar)
    #     params = {
    #             "cellar_id": str(cellar.id),
    #             "row": None,
    #             "column": None,
    #     }

    #     # Act
    #     status_code, body = self._make_request("put", f"{self.base_path}{str(wine.id)}/space/", self.user, params=params)

    #     # Assert
    #     self.assertEqual(status.HTTP_200_OK, status_code)

    #     wine = Wine.objects.select_cellarspace().get_by_id(wine.id)
    #     self.assertEqual(cellar.id, wine.cellar_id)
    #     self.assertEqual(params["row"], wine.row)
    #     self.assertEqual(params["column"], wine.column)

    #     expected = {
    # "wines": [
    #         {
    #             "id": str(wine.id),
    #             **params,
    #         }
    #     ]
    # }
    #     self.assertEqual(1, len(body))
    #     self._assert_dict_contains_subset(expected["wines"][0], body["wines"][0])

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

    def _assert_listed_wines_equal_expected(self, expected_wines, listed_wines):
        self.assertEqual(len(expected_wines), len(listed_wines))

        for expected, listed in zip(expected_wines, listed_wines):
            dict = {
                "id": str(expected.id),
                "drink_when": expected.drink_when,
                "name": expected.name,
                "producer": expected.producer,
                "country": expected.country.value,
                "region_1": expected.region_1,
                "region_2": expected.region_2,
                "region_3": expected.region_3,
                "region_4": expected.region_4,
                "region_5": expected.region_5,
                "cepage": expected.cepage,
                "vintage": expected.vintage,
                "bought_at": expected.bought_at.strftime("%Y-%m-%d") if expected.bought_at is not None else None,
                "bought_from": expected.bought_from,
                "price_with_tax": expected.price_with_tax,
                "drunk_at": expected.drunk_at.strftime("%Y-%m-%d") if expected.drunk_at is not None else None,
                "note": expected.note,
                "cellar_id": str(expected.cellarspace.cellar_id) if hasattr(expected, "cellarspace") else None,
                "row": expected.cellarspace.row if hasattr(expected, "cellarspace") else None,
                "column": expected.cellarspace.column if hasattr(expected, "cellarspace") else None,
            }
            self.assertDictEqual(dict, listed)

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
