from rest_framework import serializers
from .models import Transaction, Notification, MonthlyBalance

class TransactionSerializer(serializers.ModelSerializer):
    purpose = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'amount', 'purpose', 'date', 'created_at']
        read_only_fields = ['id']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

class MonthlyBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBalance
        fields = ['year', 'month', 'monthly_income', 'starting_balance', 'current_balance', 'daily_expense_used_dates']
        read_only_fields = ['daily_expense_used_dates']