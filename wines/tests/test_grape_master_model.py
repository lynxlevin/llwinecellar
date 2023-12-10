from django.test import TestCase

from llwinecellar.common.test_utils import GrapeMasterFactory, UserFactory
from wines.models import GrapeMaster


class TestGrapeMasterModel(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.grapes = [
            GrapeMasterFactory(name="Pinot Noir", abbreviation="PN", user=cls.user),
            GrapeMasterFactory(name="Cabernet Sauvignon", abbreviation="CS", user=cls.user),
            GrapeMasterFactory(name="Merlot", abbreviation="Mr", user=cls.user),
            GrapeMasterFactory(name="Syrah", abbreviation=None, user=cls.user),
        ]
        cls._different_user_grape = GrapeMasterFactory()

    def test_get_by_id(self):
        result = GrapeMaster.objects.get_by_id(self.grapes[0].id)

        self.assertEqual(result, self.grapes[0])

    def test_filter_eq_user_id(self):
        result = GrapeMaster.objects.filter_eq_user_id(self.user.id)
        expected = self.grapes

        self.assertListEqual(expected, list(result))

    def test_get_by_use_id_and_name(self):
        expected = self.grapes[0]
        result = GrapeMaster.objects.get_by_user_id_and_name(self.user.id, expected.name)

        self.assertEqual(expected.id, result.id)
