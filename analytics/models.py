from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SpendingAnalytics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    week_start = models.DateField()
    total_income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    savings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'week_start']

class SpendingRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    recommendation_text = models.TextField()
    category = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)