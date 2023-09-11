from django.test import TestCase

from llwinecellar.common.test_utils import UserFactory, WineTagFactory
from wines.models import WineTag


class TestWineModel(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()

    def test_filter_eq_user_id(self):
        tags = WineTagFactory.create_batch(10, user=self.user)
        _not_my_tags = WineTagFactory.create_batch(10)

        expected = tags

        result = list(WineTag.objects.filter_eq_user_id(self.user.id).order_by("created_at").all())

        self.assertEqual(expected, result)
