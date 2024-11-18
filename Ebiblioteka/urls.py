from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView
from Ebiblioteka import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Swagger schema setup
schema_view = get_schema_view(
    openapi.Info(
        title="E-biblioteka API",
        default_version='v1',
        description="API documentation for E-biblioteka",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # JWT Token Endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Category URLs
    path('categories/', views.category_list_create, name='category-list-create'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),

    # User URLs
    path('users/', views.user_list, name='user-list'),
    path('users/register/', views.user_create, name='user-create'),
    path('users/<int:pk>/', views.user_detail, name='user-detail'),
    path('users/<int:pk>/update/', views.user_update_delete, name='user-update-delete'),

    # Book URLs
    path('books/', views.book_list_create, name='book-list-create'),
    path('books/<int:pk>/', views.book_detail, name='book-detail'),
    path('books/<int:book_id>/comments/', views.book_comments, name='book-comments'),

    # Comment URLs
    path('comments/', views.comment_list_create, name='comment-list-create'),
    path('comments/<int:pk>/', views.comment_detail, name='comment-detail'),

    # Reservation URLs
    path('reservations/', views.reservation_list_create, name='reservation-list-create'),
    path('reservations/<int:pk>/', views.reservation_detail, name='reservation-detail'),

    # Swagger/OpenAPI URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
