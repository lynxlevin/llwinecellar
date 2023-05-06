from django.test import Client, TestCase
from rest_framework import status
from llwinecellar.common.test_utils import TestSeed, factory


class TestUserRelationViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_list(self):
        """
        Get /api/cellars/
        """
        user = self.seeds.users[0]
        cellar_1 = factory.create_cellar({"user": user})
        cellar_2 = factory.create_cellar({"user": user})

        _cellar_for_different_user = factory.create_cellar(
            {"user": self.seeds.users[1]}
        )

        client = Client()
        client.force_login(user)
        response = client.get("/api/cellars/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data
        self.assertNotEqual(0, len(data))

        cellars = data["cellars"]

        self.assertEqual(2, len(cellars))
        self.assertEqual(str(cellar_1.id), cellars[0]["id"])
        self.assertEqual(str(cellar_2.id), cellars[1]["id"])
        # MYMEMO: add other fields
        # MYMEMO: add exceptions
