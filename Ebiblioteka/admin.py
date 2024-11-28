from django.contrib import admin
from .models import User, Book, Comment

admin.site.register(User)
admin.site.register(Book)
admin.site.register(Comment)
