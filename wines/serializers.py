from rest_framework import serializers

from .enums import Country


class WineSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    # MYMEMO: add validation using preference
    drink_when = serializers.CharField(allow_blank=True)
    name = serializers.CharField(allow_blank=True, max_length=256)
    producer = serializers.CharField(allow_blank=True, max_length=128)
    country = serializers.ChoiceField(allow_null=True, choices=Country.choices)
    region_1 = serializers.CharField(allow_blank=True, max_length=128)
    region_2 = serializers.CharField(allow_blank=True, max_length=128)
    region_3 = serializers.CharField(allow_blank=True, max_length=128)
    region_4 = serializers.CharField(allow_blank=True, max_length=128)
    region_5 = serializers.CharField(allow_blank=True, max_length=128)
    cepage = serializers.ListField(child=serializers.DictField(required=False))
    vintage = serializers.IntegerField(
        allow_null=True, min_value=0, max_value=32_767, default=None
    )
    bought_at = serializers.DateField(allow_null=True)
    bought_from = serializers.CharField(allow_blank=True, max_length=64)
    price_with_tax = serializers.IntegerField(
        allow_null=True, min_value=0, max_value=2_147_483_647
    )
    drunk_at = serializers.DateField(allow_null=True)
    note = serializers.CharField(allow_blank=True)
