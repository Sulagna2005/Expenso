from django.urls import path
from . import views

urlpatterns = [
    path('savings/', views.SavingsGoalListCreateView.as_view(), name='savings-goals'),
    path('challenges/', views.ChallengeListView.as_view(), name='challenges'),
    path('user-challenges/', views.UserChallengeListView.as_view(), name='user-challenges'),
    path('rewards/', views.reward_points, name='reward-points'),
]