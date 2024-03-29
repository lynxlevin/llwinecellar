# Generated by Django 4.2.1 on 2023-08-25 00:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("wines", "0002_alter_wine_country_rename_country_wine__country_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="WineTag",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("text", models.CharField(max_length=256, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="WineTagRelation",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("tag_master", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="wines.winetag")),
                ("wine", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="wines.wine")),
            ],
        ),
        migrations.AddField(
            model_name="wine",
            name="tags",
            field=models.ManyToManyField(through="wines.WineTagRelation", to="wines.winetag"),
        ),
    ]
