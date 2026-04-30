from rest_framework import serializers
from .models import Price, PriceBudgetUser
from django.utils import timezone


class PriceBudgetUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceBudgetUser
        fields = '__all__'


class AwardPointsSerializer(serializers.Serializer):
    points = serializers.IntegerField(min_value=1)

class PriceSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(required=False, default=timezone.now)

    class Meta:
        model = Price
        fields = '__all__'