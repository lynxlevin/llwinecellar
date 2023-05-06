from rest_framework import serializers


class CellarSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField()
    layout = serializers.ListField(child=serializers.IntegerField())
    has_basket = serializers.BooleanField()


class CellarsSerializer(serializers.Serializer):
    cellars = CellarSerializer(many=True)
