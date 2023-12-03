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

        exported_text_lines = []
        with open(file_path, "r", encoding="utf_8") as f:
            for line in f:
                exported_text_lines.append(line)

        expected_lines = ["abc,def\n", "ghi"]
        self.assertEqual(expected_lines, exported_text_lines)

        os.remove(file_path)
