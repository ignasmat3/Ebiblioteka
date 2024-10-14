from django.urls import path
from .views import get_book,create_book, book_detail

urlpatterns = [
    path('book/', get_book, name='get_book'),
    path('create/', create_book, name='create_book'),

    path('book/<int:pk>', book_detail, name='book_detail'),
]