from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from Ebiblioteka import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView, smthsmth,UserDetailView

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
    # Authentication / Session Endpoints
    path('api/user/details/', UserDetailView.as_view(), name='user-detail'),
    path('api/user/', smthsmth.as_view(), name='get_name'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

    # Category Endpoints
    path('categories/list', views.category_list_get, name='category-list-get'),
    path('categories/create', views.category_list_create, name='category-list-create'),
    path('categories/<int:pk>/detail', views.category_detail_get, name='category-detail_get'),
    path('categories/<int:pk>/update', views.category_detail_put, name='category-detail_put'),
    path('categories/<int:pk>/delete', views.category_detail_delete, name='category-detail_delete'),

    # User Endpoints
    path('users/list', views.user_list_get, name='user-list-get'),
    path('users/register', views.user_create, name='user-create'),
    path('users/<int:pk>/detail', views.user_detail_get, name='user-detail-get'),
    path('users/<int:pk>/update', views.user_update_put, name='user-update-put'),
    path('users/<int:pk>/delete', views.user_delete, name='user-update-delete'),

    # Book Endpoints
    path('books/list', views.book_list_get, name='book-list-get'),
    path('books/create', views.book_list_create, name='book-list-create'),
    path('books/<int:pk>/detail', views.book_detail_get, name='book-detail_get'),
    path('books/<int:pk>/update', views.book_detail_put, name='book-detail_put'),
    path('books/<int:pk>/delete', views.book_detail_delete, name='book-detail_delete'),

    # Comment Endpoints (Nested under Category and Book)
    path('categories/<int:cat_id>/books/<int:book_id>/comments/list', views.comment_list_get, name='comment-list-get'),
    path('categories/<int:cat_id>/books/<int:book_id>/comments/create', views.comment_list_create, name='comment-list-create'),
    path('categories/<int:cat_id>/books/<int:book_id>/comments/<int:pk>/detail', views.comment_detail_get, name='comment-detail_get'),
    path('categories/<int:cat_id>/books/<int:book_id>/comments/<int:pk>/update', views.comment_detail_put, name='comment-detail_put'),
    path('categories/<int:cat_id>/books/<int:book_id>/comments/<int:pk>/delete', views.comment_detail_delete, name='comment-detail_delete'),

    # Swagger/OpenAPI URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
