from datetime import datetime

from django.core.management.base import BaseCommand, CommandParser

from cellars.models import Cellar, CellarSpace
from wines.enums import Country
from wines.models import Wine, WineTag

FILE_DIR = "wines/fixtures"


class Command(BaseCommand):
    def add_arguments(self, parser: CommandParser) -> None:
        # parser.add_argument("--cellar_id", type=str)
        # parser.add_argument("--user_id", type=int)
        parser.add_argument("--file_name", type=str)

    def handle(self, *args, **options):
        # cellar_id = options["cellar_id"]
        # user_id = options["user_id"]
        file_name = options["file_name"]

        csv_lines = []
        with open(f"{FILE_DIR}/{file_name}", "r", encoding="utf_8") as f:
            for line in f:
                if "⭐︎," in line:
                    csv_lines.append(line)
                else:
                    csv_lines[-1] += line

        cellar = Cellar.objects.first()

        cellar_spaces = []

        for line in csv_lines:
            li = iter(line.strip().split(","))
            _new_record_mark = next(li)
            wine = Wine(
                name=next(li),
                producer=next(li),
                country=Country.from_label(next(li)),
                region_1=next(li),
                region_2=next(li),
                region_3=next(li),
                region_4=next(li),
                region_5=next(li),
                vintage=int(vin) if (vin := next(li)) != "" else None,
                bought_at=next(li),
                bought_from=next(li),
                price=int(price) if (price := next(li)) != "" else None,
                drunk_at=next(li),
                note=next(li),
                user_id=1,
            )

            wine.bought_at = datetime.strptime(wine.bought_at, "%Y/%m/%d") if wine.bought_at else None
            wine.drunk_at = datetime.strptime(wine.drunk_at, "%Y/%m/%d") if wine.drunk_at else None

            wine.save()

            # tag は 1 つのみでstr で指定
            tag_text = next(li)
            if tag_text != "":
                tags = [WineTag.objects.get_or_create(user_id=1, text=tag_text)[0]]
                wine.tags.set(tags)

            position = next(li)
            if position != "":
                row, column = position.split("-")

                cellar_space = CellarSpace.objects.get_by_cellar_row_column(cellar.id, row, column)
                cellar_space.wine = wine
                cellar_spaces.append(cellar_space)
        CellarSpace.objects.bulk_update(cellar_spaces, fields=["wine"])
