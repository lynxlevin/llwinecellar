# Generated by Django 4.2.1 on 2024-05-13 07:29

from django.contrib.postgres.operations import UnaccentExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("wines", "0008_alter_cepage_grape"),
    ]

    operations = [UnaccentExtension()]