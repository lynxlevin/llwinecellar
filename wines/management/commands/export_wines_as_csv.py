import csv

from django.core.management.base import BaseCommand, CommandParser

from wines.models import Wine

FILE_DIR = "wines/fixtures"


class Command(BaseCommand):
    # def add_arguments(self, parser: CommandParser) -> None:
    # parser.add_argument("--user_id", type=int)

    def handle(self, *args, **options):
        # user_id = options["user_id"]
        wines = Wine.objects.all()
        text_lines = [
            [
                wine.cellarspace.cellar.name,
                wine.position,
                # wine.tags,
                wine.name,
                wine.producer,
                wine.vintage,
                wine.price,
                wine.country.label,
                wine.region_1,
                wine.region_2,
                wine.region_3,
                wine.region_4,
                wine.region_5,
                # wine.cepages,
                wine.bought_at,
                wine.bought_from,
                wine.drunk_at,
                wine.note,
            ]
            for wine in wines
        ]
        with open("exports/wines.csv", "w", encoding="utf_8") as f:
            writer = csv.writer(f)
            writer.writerows(text_lines)
