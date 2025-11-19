from django.db import models
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    purpose = models.CharField(max_length=200, blank=True, default='')
    date = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

class MonthlyBalance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_balances')
    year = models.IntegerField()
    month = models.IntegerField()
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    starting_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    daily_expense_used_dates = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'year', 'month']
        ordering = ['-year', '-month']
    
    def calculate_balance(self):
        """Calculate current balance for this month"""
        transactions = Transaction.objects.filter(
            user=self.user,
            date__year=self.year,
            date__month=self.month
        )
        
        income = transactions.filter(transaction_type='income').aggregate(
            total=models.Sum('amount'))['total'] or 0
        expenses = transactions.filter(transaction_type='expense').aggregate(
            total=models.Sum('amount'))['total'] or 0
        
        self.current_balance = self.starting_balance + self.monthly_income + income - expenses
        return self.current_balance

class MonthlyGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_goals')
    year = models.IntegerField()
    month = models.IntegerField()
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'year', 'month']
        ordering = ['-year', '-month']

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']