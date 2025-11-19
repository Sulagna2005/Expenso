from rest_framework import serializers
from .models import SavingsGoal, Challenge, UserChallenge, RewardPoints

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'target_amount', 'current_amount', 'month', 'is_achieved']
        read_only_fields = ['id', 'is_achieved']

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'description', 'reward_points', 'target_amount']

class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(read_only=True)
    
    class Meta:
        model = UserChallenge
        fields = ['id', 'challenge', 'is_completed', 'completed_at']

class RewardPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardPoints
        fields = ['total_points']