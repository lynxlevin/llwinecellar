from django.test import TestCase
from llwinecellar.common.test_utils.test_seeds import TestSeed

from users.models import User


class TestUserModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()
