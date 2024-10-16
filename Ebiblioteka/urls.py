from django.urls import path
from Ebiblioteka import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # User
    path('users/', views.user_list, name='user-list'),
    path('users/register/', views.user_create, name='user-create'),
    path('users/<int:pk>/', views.user_detail, name='user-detail'),
    path('users/<int:pk>/update/', views.user_update_delete, name='user-update-delete'),

    # Book
    path('books/', views.book_list_create, name='book-list-create'),
    path('books/<int:pk>/', views.book_detail, name='book-detail'),
    path('books/<int:book_id>/comments/', views.book_comments, name='book-comments'),

    # Comment
    path('comments/', views.comment_list_create, name='comment-list-create'),
    path('comments/<int:pk>/', views.comment_detail, name='comment-detail'),

    #OPENAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
