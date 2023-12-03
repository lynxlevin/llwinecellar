import csv
import json
import os

from django.core.management import call_command
from django.test import TestCase

from llwinecellar.common.test_utils import (
    CellarFactory,
    CepageFactory,
    DrunkWineFactory,
    GrapeMasterFactory,
    UserFactory,
    WineFactory,
    WineInRackFactory,
    WineTagFactory,
)


class TestExportWinesAsCsv(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.cellar = CellarFactory(user=cls.user)
        cls.grapes = [
            GrapeMasterFactory(user=cls.user),
            GrapeMasterFactory(user=cls.user, name="Cabernet Sauvignon", abbreviation="CS"),
            GrapeMasterFactory(user=cls.user, name="Merlot", abbreviation="Mr"),
        ]
        cls.tags = WineTagFactory.create_batch(5, user=cls.user)

    """
    MYMEMO:
    - add with_header flag.
    - add import command: refresh_all flag, with caution message.
    - バッチ実行して、古いものの削除機能付きでバッチ実行もいいかも
    """

    def test_export(self):
        self.wines = [
            WineInRackFactory(user=self.user, cellar=self.cellar, row=1, column=2),
            WineFactory(user=self.user),
            WineFactory(user=self.user, country=None),
            DrunkWineFactory(user=self.user),
        ]
        CepageFactory(wine=self.wines[0], grape=self.grapes[1], percentage=60.0)
        CepageFactory(wine=self.wines[0], grape=self.grapes[2], percentage=40.0)
        self.wines[0].tags.set(self.tags[1::2])

        file_path = "exports/wines.csv"

        call_command("export_wines_as_csv")

        with open(file_path, "r", encoding="utf_8") as f:
            reader = csv.reader(f)
            exported_csv_rows = [row for row in reader]

        expected_csv_rows = [self._get_expected_row_fow_wine(wine) for wine in self.wines]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

        os.remove(file_path)

    def test_export_with_id(self):
        self.wines = [
            WineInRackFactory(user=self.user, cellar=self.cellar, row=1, column=2),
            WineFactory(user=self.user),
            WineFactory(user=self.user, country=None),
            DrunkWineFactory(user=self.user),
        ]
        CepageFactory(wine=self.wines[0], grape=self.grapes[1], percentage=60.0)
        CepageFactory(wine=self.wines[0], grape=self.grapes[2], percentage=40.0)
        self.wines[0].tags.set(self.tags[1::2])

        file_path = "exports/wines.csv"

        call_command("export_wines_as_csv", "--with-id")

        with open(file_path, "r", encoding="utf_8") as f:
            reader = csv.reader(f)
            exported_csv_rows = [row for row in reader]

        expected_csv_rows = [self._get_expected_row_fow_wine(wine, with_id=True) for wine in self.wines]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

        os.remove(file_path)

    def _get_expected_row_fow_wine(self, wine, with_id=False):
        base_row = [
            wine.cellarspace.cellar.name if hasattr(wine, "cellarspace") else "",
            wine.position if hasattr(wine, "cellarspace") else "",
            ", ".join(wine.tag_texts),
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
            json.dumps(
                [
                    {"name": c.name, "abbreviation": c.abbreviation, "percentage": str(c.percentage)}
                    for c in wine.cepages.all()
                ]
            ),
            wine.bought_at.isoformat() if wine.bought_at else "",
            wine.bought_from,
            wine.drunk_at.isoformat() if wine.drunk_at else "",
            wine.note,
        ]
        if with_id:
            base_row.insert(0, str(wine.id))
        return base_row
