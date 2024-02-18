from rest_framework import serializers


class WineMemoSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    entry = serializers.CharField()
    title = serializers.CharField()


class WineMemosSerializer(serializers.Serializer):
    wine_memos = WineMemoSerializer(many=True, read_only=True)


class WineMemoRequestSerializer(serializers.Serializer):
    entry = serializers.CharField()
    title = serializers.CharField()
