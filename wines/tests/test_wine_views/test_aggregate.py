import logging
from datetime import date

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import DrunkWineFactory, UserFactory, WineFactory

logger = logging.getLogger(__name__)


class TestAggregate(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wines/aggregate/"
        cls.user = UserFactory()

    def test_total_price_of_drunk_wines(self):
        # Arrange
        _wine = WineFactory(user=self.user, price_with_tax=12300)
        _drunk_wines = [
            DrunkWineFactory(user=self.user, price_with_tax=2500),
            DrunkWineFactory(user=self.user, price_with_tax=6000),
        ]
        _different_user_drunk_wine = DrunkWineFactory(price_with_tax=9999)

        # Act
        status_code, body = self._make_request(f"{self.base_path}?is_drunk=true", self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self.assertEqual(8500, body["aggregation"])

    def test_total_price_of_drunk_wines_on_certain_month(self):
        # Arrange
        _wine = WineFactory(user=self.user, price_with_tax=12300)
        _drunk_wines = [
            DrunkWineFactory(user=self.user, price_with_tax=2500, drunk_at=date(2023, 11, 1)),
            DrunkWineFactory(user=self.user, price_with_tax=6000, drunk_at=date(2023, 11, 5)),
            DrunkWineFactory(user=self.user, price_with_tax=3800, drunk_at=date(2023, 10, 31)),
            DrunkWineFactory(user=self.user, price_with_tax=10000, drunk_at=date(2023, 12, 1)),
        ]
        _different_user_drunk_wine = DrunkWineFactory(price_with_tax=9999)

        # Act
        status_code, body = self._make_request(
            f"{self.base_path}?is_drunk=true&drunk_at__gte=2023-11-01&drunk_at__lte=2023-11-30", self.user
        )

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        self.assertEqual(8500, body["aggregation"])

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())
