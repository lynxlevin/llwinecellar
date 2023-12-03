import csv
import json

from django.core.management.base import BaseCommand, CommandParser

from wines.models import Wine

FILE_DIR = "wines/fixtures"


class Command(BaseCommand):
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--with-id", action="store_true")
        parser.add_argument("--with-header", action="store_true")

    def handle(self, *args, **options):
        """
        python manage.py export_wines_as_csv
        python manage.py export_wines_as_csv --with-id
        python manage.py export_wines_as_csv --with-header
        python manage.py export_wines_as_csv --with-id --with-header
        """
        with_id = options["with_id"]
        with_header = options["with_header"]

        wines = Wine.objects.all()
        text_rows = [self._get_row_for_wine(wine, with_id=with_id) for wine in wines]
        if with_header:
            text_rows.insert(0, self._get_header_row(with_id=with_id))
        with open("exports/wines.csv", "w", encoding="utf_8") as f:
            writer = csv.writer(f)
            writer.writerows(text_rows)

    def _get_row_for_wine(self, wine, with_id=False):
        base_row = [
            wine.cellarspace.cellar.name if hasattr(wine, "cellarspace") else None,
            wine.position,
            ", ".join(wine.tag_texts),
            wine.name,
            wine.producer,
            wine.vintage,
            wine.price,
            wine.country.label if wine.country else None,
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
            wine.bought_at,
            wine.bought_from,
            wine.drunk_at,
            wine.note,
        ]
        if with_id:
            base_row.insert(0, wine.id)

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
