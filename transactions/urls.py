from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('history/', views.TransactionHistoryView.as_view(), name='transaction-history'),
    path('dashboard/', views.dashboard_data, name='dashboard-data'),
    path('statistics/', views.user_statistics, name='user-statistics'),
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('<int:pk>/delete/', views.TransactionDeleteView.as_view(), name='transaction-delete'),
    path('monthly/<int:year>/<int:month>/', views.monthly_statistics, name='monthly-statistics'),
    path('monthly-income/', views.monthly_income_management, name='monthly-income-management'),
    path('cumulative-balance/', views.cumulative_balance_history, name='cumulative-balance-history'),
    path('daily-expense/check/', views.check_daily_expense_usage, name='check-daily-expense'),
    path('daily-expense/mark/', views.mark_daily_expense_used, name='mark-daily-expense'),
    path('daily-expense/add/', views.add_daily_expense_for_date, name='add-daily-expense'),
    path('user-activity/', views.check_user_activity, name='check-user-activity'),
    path('monthly-goals/', views.monthly_goal_management, name='monthly-goal-management'),
]