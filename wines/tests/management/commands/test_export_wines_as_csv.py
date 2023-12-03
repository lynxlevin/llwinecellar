import csv
import os

from django.core.management import call_command
from django.test import TestCase

from llwinecellar.common.test_utils import CellarFactory, DrunkWineFactory, UserFactory, WineFactory, WineInRackFactory


class TestExportWinesAsCsv(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.cellar = CellarFactory(user=cls.user)
        cls.wines = [WineInRackFactory(user=cls.user, cellar=cls.cellar, row=1, column=2)]

    def test_export_for_all_users(self):
        file_path = "exports/wines.csv"
        wine = self.wines[0]

        call_command("export_wines_as_csv")

        with open(file_path, "r", encoding="utf_8") as f:
            reader = csv.reader(f)
            exported_csv_rows = [row for row in reader]

        expected_csv_rows = [["abc", "def"], ["ghi"]]
        expected_csv_rows = [
            [
                wine.cellarspace.cellar.name,
                wine.position,
                # wine.tags,
                wine.name,
                wine.producer,
                str(wine.vintage),
                str(wine.price),
                wine.country.label,
                wine.region_1,
                wine.region_2,
                wine.region_3,
                wine.region_4,
                wine.region_5,
                # wine.cepages,
                wine.bought_at.isoformat() if wine.bought_at else "",
                wine.bought_from,
                wine.drunk_at.isoformat() if wine.drunk_at else "",
                wine.note,  # MYMEMO: add new lines and commas.
            ]
        ]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

        os.remove(file_path)

    # def test_export_per_user(self):
    # def test_export_per_cellar(self):
