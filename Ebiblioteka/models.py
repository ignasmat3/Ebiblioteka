from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.conf import settings


class User(AbstractUser):
    ROLE_CHOICES = (
        ('guest', 'Guest'),
        ('reader', 'Reader'),
        ('librarian', 'Librarian'), #eina nx
        ('admin', 'Admin'),
    )

    #ivertink ar turetu but setas priklausant nuo to ar reikes stakinti roles
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='guest')

    def __str__(self):
        return self.username


class UserSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    refresh_token = models.CharField(max_length=255)
    session_key = models.CharField(max_length=40, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expired = models.BooleanField(default=False)

    def __str__(self):
        return f"Session for {self.user.username}"

class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Book(models.Model):
    category = models.ForeignKey(
        Category,
        related_name='books',
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    description = models.TextField()
    release_year = models.IntegerField(null=True, blank=True)  # naujas laukas
    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# create a session that tracks user interaction with api. You may also save the refrash token inside if it is valid for a reasonably long time.
# Session can be revoked after the user loggs off reventing the abuse of the access tokken - if the session is not valid tokken is not refreshed
#make sure that session is unique for a user at the time


class Comment(models.Model):
    book = models.ForeignKey(Book, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='comments', on_delete=models.CASCADE)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    #fk_userID

    def __str__(self):
        return f'Comment by {self.user.username} on {self.book.title}'
