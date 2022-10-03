from users.models import User
from llwinecellar.common.test_utils import factory


class TestSeed:
    users: list[User]

    def setUp(self):
        self.setUpUsers()

    def setUpUsers(self):
        self.users = []

        args = [
            ("test_user1", "test1@test.com", "password1"),  # 0
            ("test_user2", "test2@test.com", "password2"),  # 1
            ("test_user3", "test3@test.com", "password3"),  # 2
            ("test_user4", "test4@test.com", "password4"),  # 3
        ]

        for arg in args:
            user = factory.create_user(*arg)
            self.users.append(user)
