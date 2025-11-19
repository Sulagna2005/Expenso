from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    month = models.DateField()
    is_achieved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'month']

class Challenge(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    reward_points = models.IntegerField()
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserChallenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RewardPoints(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='reward_points')
    total_points = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)