# Generated by Django 4.2.1 on 2023-12-03 06:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("wines", "0006_alter_wine_name"),
    ]

    operations = [
        migrations.RenameField(
            model_name="wine",
            old_name="price_with_tax",
            new_name="price",
        ),
    ]
