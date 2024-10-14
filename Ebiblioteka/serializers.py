from rest_framework import serializers
from .models import Book, Comment, User

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User(
            name=validated_data['name'],
            email=validated_data['email'],
            role=validated_data.get('role', 'guest')
        )
        user.password = validated_data['password']  # Reikėtų užšifruoti
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.email = validated_data.get('email', instance.email)
        instance.role = validated_data.get('role', instance.role)
        instance.password = validated_data.get('password', instance.password)
        instance.save()
        return instance
