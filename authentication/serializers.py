from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'country']
        extra_kwargs = {
            'email': {'required': True},
            'password': {'required': True, 'write_only': True},
            'full_name': {'required': True},
            'country': {'required': True}
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")

        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value.lower()

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Full name is required.")
        return value.strip()

    def validate_country(self, value):
        if not value:
            raise serializers.ValidationError("Country is required.")
        return value

    def create(self, validated_data):
        try:
            # Set username to email for uniqueness
            validated_data['username'] = validated_data['email']
            user = User.objects.create_user(**validated_data)
            return user
        except IntegrityError:
            raise serializers.ValidationError("User with this email already exists.")

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email', '').lower()
        password = data.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        user = authenticate(request=self.context.get('request'), username=email, password=password)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid email or password.")

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'full_name', 'country', 'currency', 'phone', 'profile_picture', 'monthly_income', 'estimated_expenses', 
                 'initial_balance', 'card_number', 'card_holder_name', 'profile_setup_complete']
        read_only_fields = ['email', 'currency']
    
    def validate_full_name(self, value):
        if value and not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value.strip() if value else value