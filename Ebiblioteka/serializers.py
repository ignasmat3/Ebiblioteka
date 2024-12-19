from rest_framework import serializers
from .models import Book, Comment, Category
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer  # Added import here
)
from django.utils.crypto import get_random_string
from .models import UserSession
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Authenticate the user and get the tokens
        data = super().validate(attrs)
        user = self.user

        # Get the refresh token
        refresh = self.get_token(user)

        # Create access token from refresh token
        access = refresh.access_token

        # Add custom claims to access token only
        access['role'] = user.role

        # Update data with the tokens
        data['access'] = str(access)
        data['refresh'] = str(refresh)

        # Invalidate existing session
        UserSession.objects.filter(user=user).delete()

        # Create new session
        session_key = get_random_string(length=40)
        refresh_token = str(refresh)

        UserSession.objects.create(
            user=user,
            session_key=session_key,
            refresh_token=refresh_token,
            expired=False
        )

        # Include session_key in the response
        data['session_key'] = session_key

        return data



class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        request = self.context['request']
        refresh_token = request.COOKIES.get('refresh_token')
        session_key = request.COOKIES.get('session_key')

        if not refresh_token or not session_key:
            raise serializers.ValidationError('Authentication credentials were not provided.')

        # Validate session
        try:
            session = UserSession.objects.get(
                refresh_token=refresh_token,
                session_key=session_key,
                expired=False
            )
        except UserSession.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired session.')

        # Manually validate the refresh token
        try:
            refresh = RefreshToken(refresh_token)
        except Exception:
            raise serializers.ValidationError('Invalid refresh token')

        # Create new access token
        access = refresh.access_token

        # Add custom claims to access token only
        user = User.objects.get(id=refresh['user_id'])
        access['role'] = user.role

        data = {'access': str(access)}

        # Optionally rotate the refresh token
        if True:  # Replace with your condition for rotating refresh tokens
            refresh.set_jti()
            refresh.set_exp()
            new_refresh_token = str(refresh)
            data['refresh'] = new_refresh_token

            # Update the session with the new refresh token
            session.refresh_token = new_refresh_token
            session.save()
        else:
            data['refresh'] = refresh_token

        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            role='admin'  # Set default role
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'description', 'release_year', 'added_date', 'category', 'category_name']


class CategorySerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'books']

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'date', 'user_username']
        read_only_fields = ('user',)
