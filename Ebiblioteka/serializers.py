from rest_framework import serializers
from .models import Book, Comment, Category
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserSession
from django.utils.crypto import get_random_string

User = get_user_model()
#changed naming
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Invalidate existing session
        UserSession.objects.filter(user=user).delete()

        # Create new session
        session_key = get_random_string(length=40)
        refresh_token = data['refresh']

        UserSession.objects.create(
            user=user,
            session_key=session_key,
            refresh_token=refresh_token,
            expired=False
        )

        # Include session_key in the response
        data['session_key'] = session_key

        return data


from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework import serializers
from .models import UserSession

# serializers.py
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

        # Proceed with standard validation
        data = super().validate({'refresh': refresh_token})

        # Update the session with the new refresh token
        new_refresh_token = data['refresh']
        session.refresh_token = new_refresh_token
        session.save()

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
            role='librarian'  # Set default role
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'category', 'title', 'author', 'description', 'added_date']

class CategorySerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'books']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['book', 'user', 'date']


# class ReservationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Reservation
#         fields = '__all__'
#         read_only_fields = ['user', 'date_reserved']
#

