from rest_framework import serializers
from .models import Book, Comment, Category
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()
#changed naming
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add role to the token response
        data['role'] = self.user.role

        return data

    def get_token(self, user):
        token = super().get_token(user)

        # Add custom claims
        token['role'] = user.role

        return token

    #def extract claims or specific field  user id/ user name and map to database

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

