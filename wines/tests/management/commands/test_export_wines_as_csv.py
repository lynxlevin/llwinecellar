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
    WineInBasketFactory,
    WineInRackFactory,
    WineTagFactory,
)


class TestExportWinesAsCsv(TestCase):
    maxDiff = None
    file_path = "exports/wines.csv"

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

        cls.wines = [
            WineInRackFactory(user=cls.user, cellar=cls.cellar, row=1, column=2),
            WineInBasketFactory(user=cls.user, cellar=cls.cellar),
            WineFactory(user=cls.user, country=None),
            DrunkWineFactory(user=cls.user),
        ]
        CepageFactory(wine=cls.wines[0], grape=cls.grapes[1], percentage=60.0)
        CepageFactory(wine=cls.wines[0], grape=cls.grapes[2], percentage=40.0)
        cls.wines[0].tags.set(cls.tags[1::2])

    @classmethod
    def tearDownClass(cls):
        os.remove(cls.file_path)

    """
    MYMEMO:
    - add import command: refresh_all flag, with caution message.
    - バッチ実行して、古いものの削除機能付きでバッチ実行もいいかも
    """

    def test_export(self):
        call_command("export_wines_as_csv")

        exported_csv_rows = self._get_csv_rows()

        expected_csv_rows = [self._get_expected_row_fow_wine(wine) for wine in self.wines]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

    def test_export_with_id(self):
        call_command("export_wines_as_csv", "--with-id")

        exported_csv_rows = self._get_csv_rows()

        expected_csv_rows = [self._get_expected_row_fow_wine(wine, with_id=True) for wine in self.wines]
        self.assertEqual(expected_csv_rows, exported_csv_rows)

    def test_export_with_header(self):
        call_command("export_wines_as_csv", "--with-header")

        exported_csv_rows = self._get_csv_rows()

        expected_csv_rows = [self._get_expected_row_fow_wine(wine) for wine in self.wines]
        expected_csv_rows.insert(0, self._get_header_row())
        self.assertEqual(expected_csv_rows, exported_csv_rows)

    def test_export_with_id_and_header(self):
        call_command("export_wines_as_csv", "--with-id", "--with-header")

        exported_csv_rows = self._get_csv_rows()

        expected_csv_rows = [self._get_expected_row_fow_wine(wine, with_id=True) for wine in self.wines]
        expected_csv_rows.insert(0, self._get_header_row(with_id=True))
        self.assertEqual(expected_csv_rows, exported_csv_rows)

    """
    Util Functions
    """

    def _get_csv_rows(self):
        with open(self.file_path, "r", encoding="utf_8") as f:
            reader = csv.reader(f)
            exported_csv_rows = [row for row in reader]
        return exported_csv_rows

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

    def _get_header_row(self, with_id=False):
        base_header_row = [
            "cellar_name",
            "position",
            "tag_texts",
            "name",
            "producer",
            "vintage",
            "price",
            "country",
            "region_1",
            "region_2",
            "region_3",
            "region_4",
            "region_5",
            "cepages",
            "bought_at",
            "bought_from",
            "drunk_at",
            "note",
        ]
        if with_id:
            base_header_row.insert(0, "id")
        return base_header_row
