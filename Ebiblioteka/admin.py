from django.contrib import admin
from .models import User, Book, Comment
from .models import Reservation

admin.site.register(Reservation)
admin.site.register(User)
admin.site.register(Book)
admin.site.register(Comment)
