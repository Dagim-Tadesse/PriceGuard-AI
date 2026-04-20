from rest_framework import serializers
from .models import Price
from django.utils import timezone

class PriceSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(required=False, default=timezone.now)

    class Meta:
        model = Price
        fields = '__all__'