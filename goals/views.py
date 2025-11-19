from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import SavingsGoal, Challenge, UserChallenge, RewardPoints
from .serializers import SavingsGoalSerializer, ChallengeSerializer, UserChallengeSerializer, RewardPointsSerializer

class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChallengeListView(generics.ListAPIView):
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Challenge.objects.filter(is_active=True)

class UserChallengeListView(generics.ListAPIView):
    serializer_class = UserChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserChallenge.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reward_points(request):
    points, created = RewardPoints.objects.get_or_create(user=request.user)
    serializer = RewardPointsSerializer(points)
    return Response(serializer.data)