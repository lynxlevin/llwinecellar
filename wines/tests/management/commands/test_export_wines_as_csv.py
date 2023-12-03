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
        cls.wines = [
            WineInRackFactory(user=cls.user, cellar=cls.cellar, row=1, column=2),
            WineFactory(user=cls.user),
            WineFactory(user=cls.user, country=None),
            DrunkWineFactory(user=cls.user),
        ]

    """
    MYMEMO:
    - add tags and cepages, with_id flag for not refresh_all in import.
    - add import command: refresh_all flag, with caution message.
    - バッチ実行して、古いものの削除機能付きでバッチ実行もいいかも
    """

    def test_export_for_all_users(self):
        file_path = "exports/wines.csv"

        call_command("export_wines_as_csv")

        with open(file_path, "r", encoding="utf_8") as f:
            reader = csv.reader(f)
            exported_csv_rows = [row for row in reader]

        expected_csv_rows = [
            [
                wine.cellarspace.cellar.name if hasattr(wine, "cellarspace") else "",
                wine.position if hasattr(wine, "cellarspace") else "",
                # wine.tags,
                wine.name,
                wine.producer,
                str(wine.vintage),
                str(wine.price),
                wine.country.label if wine.country else "",
                wine.region_1,
                wine.region_2,
                wine.region_3,
                wine.region_4,
                wine.region_5,
                # wine.cepages,
                wine.bought_at.isoformat() if wine.bought_at else "",
                wine.bought_from,
                wine.drunk_at.isoformat() if wine.drunk_at else "",
                wine.note,
            ]
            for wine in self.wines
        ]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

        os.remove(file_path)
