from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
# -------------------------Serializer for Admin User Management----------------------
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'role', 'status', 'date_joined', 'password']
        extra_kwargs = {
            'email': {'required': False},
            'full_name': {'required': False},
            'role': {'required': False},
            'status': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)

        if not password:
            import secrets
            password = secrets.token_urlsafe(10)

        user = CustomUser.objects.create_user(**validated_data, password=password)

        user._temp_password = password  
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# ----------------------Serializer for Current User Account----------------------
class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'password', 'role', 'status']
        extra_kwargs = {
            'email': {'required': False},
            'full_name': {'required': False},
            'role': {'required': False},
            'status': {'required': False},
        }

# -------------------------JWT Login Serializer (using email)----------------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data["role"] = self.user.role
        data["email"] = self.user.email
        data["status"] = self.user.status

        return data

# --------------------------Password Reset Serializers-------------------------------------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })

        validate_password(attrs['new_password'])

        return attrs
