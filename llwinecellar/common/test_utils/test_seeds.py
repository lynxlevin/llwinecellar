from cellars.models import Cellar
from user_preferences.models import UserPreference
from users.models import User
from llwinecellar.common.test_utils import factory


class TestSeed:
    users: list[User]
    user_preferencs: list[UserPreference]
    cellars: list[Cellar]

    def setUp(self):
        self.setUpUsers()
        self.setUpUserPreferences()
        self.setUpCellars()

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

    def setUpUserPreferences(self):
        self.user_preferences = []

        args = [
            (self.users[0], ["in a few years", "in 5 years", "later than a decade"]),
            (self.users[1], ["2025", "2030", "2035", "2040", "2045", "2050"]),
            (self.users[2], ["daily", "soon", "keep"]),
            (self.users[3], ["in a few years", "in 5 years", "later than a decade"]),
        ]

        for arg in args:
            user_preference = factory.create_user_preference(*arg)
            self.user_preferences.append(user_preference)

    def setUpCellars(self):
        self.cellars = []

        args = [
            ("cellar_1", [5, 6, 6, 6, 6], 6, self.users[0]),
            ("cellar_2", [5, 6, 6, 6, 6], 0, self.users[1]),
        ]

        for arg in args:
            cellar = factory.create_cellar(*arg)
            self.cellars.append(cellar)
