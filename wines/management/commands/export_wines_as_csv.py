import csv
import json

from django.core.management.base import BaseCommand

from wines.models import Wine

FILE_DIR = "wines/fixtures"


class Command(BaseCommand):
    def handle(self, *args, **options):
        wines = Wine.objects.all()
        text_lines = [
            [
                wine.cellarspace.cellar.name if hasattr(wine, "cellarspace") else None,
                wine.position,
                # wine.tags,
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
            for wine in wines
        ]
        with open("exports/wines.csv", "w", encoding="utf_8") as f:
            writer = csv.writer(f)
            writer.writerows(text_lines)
