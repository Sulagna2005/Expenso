from django.urls import path
from . import views

urlpatterns = [
    path('spending/', views.SpendingAnalyticsListView.as_view(), name='spending-analytics'),
    path('recommendations/', views.SpendingRecommendationListView.as_view(), name='recommendations'),
]