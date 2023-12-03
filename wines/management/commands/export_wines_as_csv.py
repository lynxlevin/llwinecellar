import csv

from django.core.management.base import BaseCommand, CommandParser

FILE_DIR = "wines/fixtures"


class Command(BaseCommand):
    # def add_arguments(self, parser: CommandParser) -> None:
    # parser.add_argument("--user_id", type=int)

    def handle(self, *args, **options):
        # user_id = options["user_id"]
        # MYMEMO: pass args to exporter class and save as csv
        text_lines = [["abc", "def"], ["ghi"]]
        with open("exports/wines.csv", "w", encoding="utf_8") as f:
            writer = csv.writer(f)
            writer.writerows(text_lines)
