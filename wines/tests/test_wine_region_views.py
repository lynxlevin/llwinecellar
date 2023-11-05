import logging

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import UserFactory, WineFactory

from ..enums import Country

logger = logging.getLogger(__name__)


class TestWineRegionViews(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wine_regions/"
        cls.user = UserFactory()

    def test_list(self):
        # Arrange
        wines = [
            WineFactory(
                user=self.user,
                country=Country.FRANCE,
                region_1="Languedoc Roussillon",
                region_2="Pays d'Oc",
                region_3="",
            ),
            WineFactory(
                user=self.user,
                country=Country.SOUTH_AFRICA,
                region_1="Western Cape",
                region_2="Coastal Region",
                region_3="Stellenbosch",
            ),
            WineFactory(
                user=self.user,
                country=Country.AMERICA,
                region_1="California",
                region_2="Central Coast",
                region_3="Santa Clara",
            ),
            WineFactory(
                user=self.user,
                country=Country.FRANCE,
                region_1="Bordeaux",
                region_2="Fronsac",
                region_3="",
            ),
            WineFactory(
                user=self.user,
                country=Country.AUSTRALIA,
                region_1="South Australia",
                region_2="Barossa",
                region_3="Barossa Valley / Clare Valley",
            ),
            WineFactory(
                user=self.user,
                country=Country.JAPAN,
                region_1="岩手",
                region_2="紫波町",
                region_3="",
            ),
            WineFactory(
                user=self.user,
                country=Country.FRANCE,
                region_1="Bourgogne",
                region_2="Côtes de Nuits",
                region_3="Vosne Romanée",
                region_4="Echézeaux",
            ),
            WineFactory(
                user=self.user,
                country=Country.FRANCE,
                region_1="Bourgogne",
                region_2="Côtes de Nuits",
                region_3="Vosne Romanée",
            ),
            # Dupulicate. Must be removed from response.
            WineFactory(
                user=self.user,
                country=Country.FRANCE,
                region_1="Bourgogne",
                region_2="Côtes de Nuits",
                region_3="Vosne Romanée",
            ),
            # No country. Must be removed from response.
            WineFactory(
                user=self.user,
                country=None,
                region_1="",
                region_2="",
                region_3="",
            ),
        ]

        _wine_different_user = WineFactory(country=Country.FRANCE, region_1="other_user", region_2="", region_3="")

        # Act
        status_code, body = self._make_request(self.base_path, self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {
            "regions": sorted(
                [
                    f"{w.country.label}>{w.region_1}>{w.region_2}>{w.region_3}>{w.region_4}>{w.region_5}"
                    for w in wines[0:-2]
                ]
            )
        }
        self.assertEqual(expected, body)

    """
    Utility functions
    """

    def _make_request(self, path, user):
        client = Client()
        client.force_login(user)

        response = client.get(path)

        return (response.status_code, response.json())
