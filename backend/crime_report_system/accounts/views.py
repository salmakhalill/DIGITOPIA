from rest_framework import status, permissions, generics, mixins
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import CustomUser
from .serializers import (
    UserSerializer,
    AccountSerializer,
    MyTokenObtainPairSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

from .permissions import IsAdmin, IsActiveUser
from .services.email_service import send_password_email
from .services.auth_service import get_user_from_uid

# ------------------ Admin User Management ------------------
class UsersMinimalView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """
    Admin-only API: list, create, update, delete users.
    Only active Admins can access.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsActiveUser, IsAdmin]
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        response = self.create(request, *args, **kwargs)

        user = CustomUser.objects.get(id=response.data["id"])

        send_password_email(
            user,
            "accounts/emails/welcome_user.html",
            "Welcome to secureReport",
            "Set your password"
        )

        return response

    def patch(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs, partial=True)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

# ------------------ Current User Account ----------------------------------------------------
class AccountView(generics.RetrieveUpdateAPIView):
    """
    API for the currently logged-in user to view/update their account.
    Only active users can access.
    """
    serializer_class = AccountSerializer
    permission_classes = [IsActiveUser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if current_password and new_password:
            if not user.check_password(current_password):
                return Response(
                    {"detail": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response(
                    {"new_password": e.messages},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)
            user.save()

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

# ------------------ JWT Login View ----------------------------------------------------------------
class MyTokenObtainPairView(TokenObtainPairView):
    """
    Login API using email + password.
    """
    serializer_class = MyTokenObtainPairSerializer

# ------------------ Password Reset Request -------------------------------------------------------
class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request password reset via email.
    Active status not required.
    """
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        email = request.data.get("email")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"message": "If email exists, reset link sent"}, status=200)

        send_password_email(
            user,
            "accounts/emails/reset_password.html",
            "Reset your secureReport password",
            "Reset your password"
        )

        return Response({"message": "Reset link sent"}, status=200)

# ------------------ Password Reset Confirm --------------------------------------------------
class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm password reset.
    Active status not required.
    """
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, uidb64, token):
        user = get_user_from_uid(uidb64)

        if not user:
            return Response({"message": "Invalid link"}, status=400)

        from django.contrib.auth.tokens import default_token_generator

        if not default_token_generator.check_token(user, token):
            return Response({"message": "Invalid or expired token"}, status=400)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({
            "success": True,
            "message": "Password updated successfully"
        }, status=200)
