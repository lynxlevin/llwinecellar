from django.test import TestCase

from llwinecellar.common.test_utils import CellarFactory, UserFactory


class TestWineModel(TestCase):
    def test_has_cellar__true(self):
        user = UserFactory()
        cellar = CellarFactory(user=user)

        result = user.has_cellar(cellar.id)

        self.assertTrue(result)

    def test_has_cellar__false(self):
        user = UserFactory()
        cellar = CellarFactory()

        result = user.has_cellar(cellar.id)

        self.assertFalse(result)

    def test_has_cellar__none_is_false(self):
        user = UserFactory()
        result = user.has_cellar(None)
        self.assertFalse(result)
