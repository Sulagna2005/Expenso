from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# Country to currency mapping - defaults to USD
COUNTRY_CURRENCY_MAP = {
    'US': 'USD', 'IN': 'INR', 'GB': 'GBP', 'CA': 'CAD', 'AU': 'AUD',
    'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
    'JP': 'JPY', 'CN': 'CNY', 'BR': 'BRL', 'MX': 'MXN', 'SG': 'SGD',
    'AE': 'AED', 'SA': 'SAR', 'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES'
}

COUNTRY_CHOICES = [
    ('US', 'United States'), ('IN', 'India'), ('GB', 'United Kingdom'),
    ('CA', 'Canada'), ('AU', 'Australia'), ('DE', 'Germany'), ('FR', 'France'),
    ('IT', 'Italy'), ('ES', 'Spain'), ('NL', 'Netherlands'), ('JP', 'Japan'),
    ('CN', 'China'), ('BR', 'Brazil'), ('MX', 'Mexico'), ('SG', 'Singapore'),
    ('AE', 'UAE'), ('SA', 'Saudi Arabia'), ('ZA', 'South Africa'),
    ('NG', 'Nigeria'), ('KE', 'Kenya')
]

class User(AbstractUser):
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=100, default='User')
    country = models.CharField(max_length=2, choices=COUNTRY_CHOICES, default='US')
    currency = models.CharField(max_length=3, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_expenses = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    initial_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    card_number = models.CharField(max_length=16, null=True, blank=True)
    card_holder_name = models.CharField(max_length=100, null=True, blank=True)
    profile_setup_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name', 'country']
    
    class Meta:
        db_table = 'auth_user'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]
    
    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.lower()
            try:
                validate_email(self.email)
            except ValidationError:
                raise ValidationError({'email': 'Enter a valid email address.'})
        
        if self.full_name:
            self.full_name = self.full_name.strip()
            if not self.full_name:
                raise ValidationError({'full_name': 'Full name cannot be empty.'})
    
    def save(self, *args, **kwargs):
        self.clean()
        if self.country and not self.currency:
            self.currency = COUNTRY_CURRENCY_MAP.get(self.country, 'USD')
        super().save(*args, **kwargs)
    
    # Add class attribute for views to access
    COUNTRY_CURRENCY_MAP = COUNTRY_CURRENCY_MAP
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"