from django.test import TestCase
from llwinecellar.common.test_utils.test_seeds import TestSeed

from users.models import User


class TestUserModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        user = self.seeds.users[0]

        result = User.objects.get_by_id(user.id)

        self.assertEqual(result, user)

    def test_create_user(self):
        user = self._get_user_params()

        self._create_user(user)

        self._assert_user_is_created(user)

    def _get_user_params(self) -> dict:
        return {
            "email": "test@test.co.jp",
            "username": "test_user",
            "password": "test_password",
        }

    def _create_user(self, user_param: dict):
        User.objects.create_user(
            user_param["email"], user_param["username"], user_param["password"]
        )

    def _assert_user_is_created(self, user_param: dict):
        created_user = User.objects.last()
        self.assertEqual(user_param["email"], created_user.email)
        self.assertEqual(user_param["username"], created_user.username)
        self.assertTrue(created_user.check_password(user_param["password"]))
