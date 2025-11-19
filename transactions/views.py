from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from datetime import timedelta, date
from .models import Transaction, Notification, MonthlyBalance, MonthlyGoal
from .serializers import TransactionSerializer, NotificationSerializer, MonthlyBalanceSerializer

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        two_months_ago = timezone.now() - timedelta(days=60)
        return Transaction.objects.filter(
            user=self.request.user,
            date__gte=two_months_ago
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user = request.user
    today = timezone.now().date()
    
    # Today's spending
    today_expenses = Transaction.objects.filter(
        user=user,
        transaction_type='expense',
        date=today
    ).aggregate(total=models.Sum('amount'))['total'] or 0
    
    # Calculate cumulative balance from all months
    cumulative_balance = user.initial_balance
    total_monthly_income = 0
    
    # Get all monthly balances for this user
    monthly_balances = MonthlyBalance.objects.filter(user=user).order_by('year', 'month')
    
    for mb in monthly_balances:
        # Add monthly income
        cumulative_balance += mb.monthly_income
        total_monthly_income += mb.monthly_income
        
        # Add transaction income and subtract expenses for this month
        month_transactions = Transaction.objects.filter(
            user=user,
            date__year=mb.year,
            date__month=mb.month
        )
        
        month_income = month_transactions.filter(transaction_type='income').aggregate(
            total=models.Sum('amount'))['total'] or 0
        month_expenses = month_transactions.filter(transaction_type='expense').aggregate(
            total=models.Sum('amount'))['total'] or 0
        
        cumulative_balance += month_income - month_expenses
    
    # Handle current month if no MonthlyBalance exists
    current_month_balance = MonthlyBalance.objects.filter(
        user=user, year=today.year, month=today.month
    ).first()
    
    if not current_month_balance:
        current_month_transactions = Transaction.objects.filter(
            user=user,
            date__year=today.year,
            date__month=today.month
        )
        
        current_month_income = current_month_transactions.filter(transaction_type='income').aggregate(
            total=models.Sum('amount'))['total'] or 0
        current_month_expenses = current_month_transactions.filter(transaction_type='expense').aggregate(
            total=models.Sum('amount'))['total'] or 0
        
        cumulative_balance += current_month_income - current_month_expenses
    
    return Response({
        'current_balance': cumulative_balance,
        'total_monthly_income': total_monthly_income,
        'today_spending': today_expenses,
        'card_number': user.card_number,
        'card_holder_name': user.card_holder_name
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_statistics(request):
    user = request.user
    monthly_income = request.data.get('monthly_income', 0)
    
    # Get current month data
    current_date = timezone.now().date()
    current_month_transactions = Transaction.objects.filter(
        user=user,
        date__year=current_date.year,
        date__month=current_date.month
    )
    
    # Calculate current month statistics
    total_transactions = current_month_transactions.count()
    total_addon = current_month_transactions.filter(transaction_type='income').aggregate(
        total=models.Sum('amount'))['total'] or 0
    total_expenses = current_month_transactions.filter(transaction_type='expense').aggregate(
        total=models.Sum('amount'))['total'] or 0
    
    # Calculate current balance using monthly income (same as history page)
    current_balance = float(monthly_income) + float(total_addon) - float(total_expenses)
    
    return Response({
        'total_transactions': total_transactions,
        'total_income': float(total_addon),
        'total_expenses': float(total_expenses),
        'current_balance': current_balance
    })

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class TransactionDeleteView(generics.DestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def monthly_statistics(request, year, month):
    user = request.user
    monthly_income = request.data.get('monthly_income', 0)
    
    # Get monthly goal data (new system)
    monthly_goal = MonthlyGoal.objects.filter(
        user=user, year=year, month=month
    ).first()
    
    # If no goal for current month, get previous month's data
    if not monthly_goal:
        prev_date = date(year, month, 1)
        if month == 1:
            prev_date = date(year - 1, 12, 1)
        else:
            prev_date = date(year, month - 1, 1)
        
        monthly_goal = MonthlyGoal.objects.filter(
            user=user, year=prev_date.year, month=prev_date.month
        ).first()
    
    # Use provided monthly_income or goal data
    effective_income = monthly_income or (monthly_goal.monthly_income if monthly_goal else 0)
    
    # Get or create monthly balance record
    monthly_balance, created = MonthlyBalance.objects.get_or_create(
        user=user,
        year=year,
        month=month,
        defaults={'monthly_income': effective_income}
    )
    
    # Update monthly income if provided
    if monthly_income:
        monthly_balance.monthly_income = monthly_income
        monthly_balance.save()
    
    transactions = Transaction.objects.filter(
        user=user,
        date__year=year,
        date__month=month
    )
    
    total_transactions = transactions.count()
    total_addon = transactions.filter(transaction_type='income').aggregate(
        total=models.Sum('amount'))['total'] or 0
    total_expenses = transactions.filter(transaction_type='expense').aggregate(
        total=models.Sum('amount'))['total'] or 0
    
    # Calculate current cumulative balance
    cumulative_balance = user.initial_balance
    
    # Add all monthly incomes and transaction balances up to current month
    all_monthly_balances = MonthlyBalance.objects.filter(
        user=user,
        year__lt=year
    ) | MonthlyBalance.objects.filter(
        user=user,
        year=year,
        month__lte=month
    )
    
    for mb in all_monthly_balances.order_by('year', 'month'):
        cumulative_balance += mb.monthly_income
        
        # Add transaction net for each month
        month_txns = Transaction.objects.filter(
            user=user,
            date__year=mb.year,
            date__month=mb.month
        )
        month_income = month_txns.filter(transaction_type='income').aggregate(
            total=models.Sum('amount'))['total'] or 0
        month_expenses = month_txns.filter(transaction_type='expense').aggregate(
            total=models.Sum('amount'))['total'] or 0
        cumulative_balance += month_income - month_expenses
    
    return Response({
        'monthly_income': float(monthly_balance.monthly_income),
        'total_transactions': total_transactions,
        'total_addon': float(total_addon),
        'total_expenses': float(total_expenses),
        'current_balance': float(cumulative_balance),
        'transactions': TransactionSerializer(transactions, many=True).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_daily_expense_usage(request):
    user = request.user
    check_date = request.data.get('date')
    
    if check_date:
        # Parse the provided date
        from datetime import datetime
        target_date = datetime.strptime(check_date, '%Y-%m-%d').date()
    else:
        # Default to today
        target_date = date.today()
    
    # Check if daily expense exists for the target date
    daily_expense_exists = Transaction.objects.filter(
        user=user,
        date=target_date,
        purpose='Daily Expense'
    ).exists()
    
    return Response({
        'used_today': daily_expense_exists,
        'date': target_date.strftime('%Y-%m-%d')
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_daily_expense_used(request):
    user = request.user
    today = date.today()
    
    monthly_balance, created = MonthlyBalance.objects.get_or_create(
        user=user,
        year=today.year,
        month=today.month
    )
    
    today_str = today.strftime('%Y-%m-%d')
    if today_str not in monthly_balance.daily_expense_used_dates:
        monthly_balance.daily_expense_used_dates.append(today_str)
        monthly_balance.save()
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_daily_expense_for_date(request):
    user = request.user
    target_date = request.data.get('date')
    daily_expense_amount = request.data.get('amount')
    
    if not target_date or not daily_expense_amount:
        return Response({'error': 'Date and amount are required'}, status=400)
    
    from datetime import datetime
    parsed_date = datetime.strptime(target_date, '%Y-%m-%d').date()
    
    # Check if daily expense already exists for this date
    existing_expense = Transaction.objects.filter(
        user=user,
        date=parsed_date,
        purpose='Daily Expense'
    ).exists()
    
    if existing_expense:
        return Response({'error': 'Daily expense already added for this date'}, status=400)
    
    # Create the transaction
    transaction = Transaction.objects.create(
        user=user,
        transaction_type='expense',
        amount=daily_expense_amount,
        purpose='Daily Expense',
        date=parsed_date
    )
    
    return Response({
        'success': True,
        'transaction': TransactionSerializer(transaction).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_activity(request):
    user = request.user
    
    # Check if user has transactions in the last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_transactions = Transaction.objects.filter(
        user=user,
        created_at__gte=thirty_days_ago
    ).count()
    
    # Consider user regular if they have more than 5 transactions in last 30 days
    is_regular_user = recent_transactions >= 5
    
    return Response({'is_regular_user': is_regular_user})

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def monthly_income_management(request):
    user = request.user
    today = date.today()
    year = request.data.get('year', today.year) if request.method == 'POST' else request.GET.get('year', today.year)
    month = request.data.get('month', today.month) if request.method == 'POST' else request.GET.get('month', today.month)
    
    if request.method == 'POST':
        monthly_income = request.data.get('monthly_income', 0)
        
        monthly_balance, created = MonthlyBalance.objects.get_or_create(
            user=user,
            year=int(year),
            month=int(month),
            defaults={'monthly_income': monthly_income}
        )
        
        if not created:
            monthly_balance.monthly_income = monthly_income
            monthly_balance.save()
        
        return Response({
            'success': True,
            'monthly_income': float(monthly_balance.monthly_income),
            'year': monthly_balance.year,
            'month': monthly_balance.month
        })
    
    else:  # GET request
        monthly_balance = MonthlyBalance.objects.filter(
            user=user,
            year=int(year),
            month=int(month)
        ).first()
        
        return Response({
            'monthly_income': float(monthly_balance.monthly_income) if monthly_balance else 0,
            'year': int(year),
            'month': int(month)
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cumulative_balance_history(request):
    user = request.user
    
    # Get all monthly balances ordered by date
    monthly_balances = MonthlyBalance.objects.filter(user=user).order_by('year', 'month')
    
    cumulative_balance = user.initial_balance
    history = []
    
    for mb in monthly_balances:
        # Calculate transactions for this month
        month_transactions = Transaction.objects.filter(
            user=user,
            date__year=mb.year,
            date__month=mb.month
        )
        
        month_income = month_transactions.filter(transaction_type='income').aggregate(
            total=models.Sum('amount'))['total'] or 0
        month_expenses = month_transactions.filter(transaction_type='expense').aggregate(
            total=models.Sum('amount'))['total'] or 0
        
        # Add monthly income and transaction net
        cumulative_balance += mb.monthly_income + month_income - month_expenses
        
        history.append({
            'year': mb.year,
            'month': mb.month,
            'monthly_income': float(mb.monthly_income),
            'transaction_income': float(month_income),
            'expenses': float(month_expenses),
            'cumulative_balance': float(cumulative_balance)
        })
    
    return Response({
        'initial_balance': float(user.initial_balance),
        'current_cumulative_balance': float(cumulative_balance),
        'monthly_history': history
    })

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def monthly_goal_management(request):
    user = request.user
    today = date.today()
    year = int(request.data.get('year', today.year) if request.method == 'POST' else request.GET.get('year', today.year))
    month = int(request.data.get('month', today.month) if request.method == 'POST' else request.GET.get('month', today.month))
    
    if request.method == 'POST':
        monthly_income = request.data.get('monthly_income', 0)
        estimated_expenses = request.data.get('estimated_expenses', 0)
        
        monthly_goal, created = MonthlyGoal.objects.get_or_create(
            user=user,
            year=year,
            month=month,
            defaults={
                'monthly_income': monthly_income,
                'estimated_expenses': estimated_expenses
            }
        )
        
        if not created:
            monthly_goal.monthly_income = monthly_income
            monthly_goal.estimated_expenses = estimated_expenses
            monthly_goal.save()
        
        return Response({
            'success': True,
            'monthly_income': float(monthly_goal.monthly_income),
            'estimated_expenses': float(monthly_goal.estimated_expenses),
            'year': monthly_goal.year,
            'month': monthly_goal.month
        })
    
    else:  # GET request
        monthly_goal = MonthlyGoal.objects.filter(
            user=user, year=year, month=month
        ).first()
        
        # If no goal for current month, get previous month's data
        if not monthly_goal:
            prev_date = date(year, month, 1)
            if month == 1:
                prev_date = date(year - 1, 12, 1)
            else:
                prev_date = date(year, month - 1, 1)
            
            monthly_goal = MonthlyGoal.objects.filter(
                user=user, year=prev_date.year, month=prev_date.month
            ).first()
        
        return Response({
            'monthly_income': float(monthly_goal.monthly_income) if monthly_goal else 0,
            'estimated_expenses': float(monthly_goal.estimated_expenses) if monthly_goal else 0,
            'year': year,
            'month': month,
            'is_current_month': monthly_goal and monthly_goal.year == year and monthly_goal.month == month if monthly_goal else False
        })