from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import SpendingAnalytics, SpendingRecommendation
from .serializers import SpendingAnalyticsSerializer, SpendingRecommendationSerializer

class SpendingAnalyticsListView(generics.ListAPIView):
    serializer_class = SpendingAnalyticsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SpendingAnalytics.objects.filter(user=self.request.user)

class SpendingRecommendationListView(generics.ListAPIView):
    serializer_class = SpendingRecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SpendingRecommendation.objects.filter(
            user=self.request.user,
            is_active=True
        )