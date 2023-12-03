import csv
import os

from django.core.management import call_command
from django.test import TestCase

from llwinecellar.common.test_utils import CellarFactory, DrunkWineFactory, UserFactory, WineFactory, WineInRackFactory


class TestExportWinesAsCsv(TestCase):
    # @classmethod
    # def setUpTestData(cls):

    def test_export_for_all_users(self):
        file_path = "exports/wines.csv"

        call_command("export_wines_as_csv")

        with open(file_path, "r", encoding="utf_8") as f:
            reader = csv.reader(f)
            exported_csv_rows = [row for row in reader]

        expected_csv_rows = [["abc", "def"], ["ghi"]]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

        os.remove(file_path)
