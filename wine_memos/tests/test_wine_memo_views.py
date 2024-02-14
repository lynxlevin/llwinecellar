from datetime import date, timedelta

from django.test import Client, TestCase
from rest_framework import status

from llwinecellar.common.test_utils import UserFactory, WineMemoFactory

from ..models import WineMemo


class TestWineMemoViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/wine_memos/"

        cls.user = UserFactory()

    def test_list(self):
        """
        Get /api/wine_memos/
        """
        # Arrange
        wine_memo_1 = WineMemoFactory(user=self.user, title="List to buy")
        wine_memo_2 = WineMemoFactory(user=self.user, title="Dream wine list")
        _wine_memo_for_different_user = WineMemoFactory()

        # Act
        status_code, body = self._make_request("get", self.base_path, self.user)

        # Assert
        self.assertEqual(status.HTTP_200_OK, status_code)

        wine_memos = body["wine_memos"]
        self.assertEqual(2, len(wine_memos))

        self.assertEqual(str(wine_memo_2.id), wine_memos[0]["id"])
        self.assertEqual(wine_memo_2.title, wine_memos[0]["title"])
        self.assertEqual(wine_memo_2.entry, wine_memos[0]["entry"])

        self.assertEqual(str(wine_memo_1.id), wine_memos[1]["id"])
        self.assertEqual(wine_memo_1.title, wine_memos[1]["title"])
        self.assertEqual(wine_memo_1.entry, wine_memos[1]["entry"])

    def test_create(self):
        """
        Post /api/wine_memos/
        """
        # Arrange
        params = {
            "title": "List to buy",
            "entry": "Latricieres Chambertin",
        }

        # Act
        status_code, body = self._make_request("post", self.base_path, self.user, params)

        # Assert
        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_wine_memo = WineMemo.objects.get_by_id(body["id"])
        self.assertEqual(params["title"], created_wine_memo.title)
        self.assertEqual(params["entry"], created_wine_memo.entry)
        self.assertEqual(self.user.id, created_wine_memo.user_id)

    def test_update(self):
        """
        Put /api/wine_memos/{wine_memo_id}/
        """
        wine_memo = WineMemoFactory(user=self.user, title="List to buy")

        params = {
            "title": "Dream wine list",
            "entry": "Le Chambertin",
        }

        status_code, body = self._make_request("put", f"{self.base_path}{wine_memo.id}/", self.user, params)

        self.assertEqual(status.HTTP_200_OK, status_code)

        wine_memo.refresh_from_db()
        self.assertEqual(params["title"], wine_memo.title)
        self.assertEqual(params["entry"], wine_memo.entry)

    # def test_update__404_on_wrong_user_wine_memo(self):


    """
    Utility Functions
    """

    def _make_request(self, method, path, user, params=None):
        client = Client()
        client.force_login(user)

        if method == "get":
            response = client.get(path)
        elif method == "post":
            response = client.post(path, params, content_type="application/json")
        elif method == "put":
            response = client.put(path, params, content_type="application/json")

        return (response.status_code, response.json())
