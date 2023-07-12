from rest_framework import serializers


class UserPreferenceItemSerializer(serializers.Serializer):
    drink_whens = serializers.ListField(child=serializers.CharField())


class UserPreferenceSerializer(serializers.Serializer):
    user_preference = UserPreferenceItemSerializer()
