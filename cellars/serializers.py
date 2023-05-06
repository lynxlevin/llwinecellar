from rest_framework import serializers


class CellarSerializer(serializers.Serializer):
    id = serializers.UUIDField()


class CellarsSerializer(serializers.Serializer):
    cellars = CellarSerializer(many=True)
