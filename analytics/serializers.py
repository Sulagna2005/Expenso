from rest_framework import serializers
from .models import SpendingAnalytics, SpendingRecommendation

class SpendingAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpendingAnalytics
        fields = ['week_start', 'total_income', 'total_expenses', 'savings']

class SpendingRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpendingRecommendation
        fields = ['recommendation_text', 'category', 'created_at']