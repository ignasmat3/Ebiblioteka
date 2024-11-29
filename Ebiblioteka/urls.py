from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from Ebiblioteka import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from .views import CustomTokenObtainPairView

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
from django.urls import path
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView
urlpatterns = [
    # JWT Token Endpoints

    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
 #    pasidaryk visus auth endpointus vienoje vietoje, Loginas negali grazinti refresh tokkeno per body, jis turi eiti per secured, http only cookie kuriame nurodytas pathas leid=ia j5 panaudoti tik refresh tokken endoointe
 #
 #
 # Pasiema tavo cookie, pažiūri ar tavo sesija validi, if so, pagal tavo refresh tokena sukuria ir pateikia tau nauja acess bei pakeičia cookie viduje esantį refesh tokena
 #    Category URL

    path('categories', views.category_list_create, name='category-list-create'),
    path('categories/get', views.category_list_get, name='category-list-get'),

    path('categories/get/<int:pk>', views.category_detail_get, name='category-detail_get'),

    path('categories/put/<int:pk>', views.category_detail_put, name='category-detail_put'),

    path('categories/delete/<int:pk>', views.category_detail_delete, name='category-detail_delete'),

    # User URLs
    path('users/', views.user_list_get, name='user-list-get'),
    path('users/register', views.user_create, name='user-create'),
    path('users/get/<int:pk>', views.user_detail_get, name='user-detail-get'),

    path('users/put/<int:pk>', views.user_update_put, name='user-update-put'),
    path('users/delete/<int:pk>', views.user_update_delete, name='user-update-delete'),

    # Book URLs
    path('books/get', views.book_list_get, name='book-list-get'),
    path('books/put', views.book_list_create, name='book-list-create'),
    path('books/get/<int:pk>', views.book_detail_get, name='book-detail_get'),
    path('books/put/<int:pk>', views.book_detail_put, name='book-detail_put'),
    path('books/delete/<int:pk>', views.book_detail_delete, name='book-detail_delete'),

    # Comment URLs

    #remove / after comments it should be cathegory/{cat_id}/books/{book_id}
    path('/comments/get', views.comment_list_get, name='comment-list-get'),
    path('/comments/put', views.comment_list_create, name='comment-list-create'),
    #Slip into separete endpoint
    # path('comments/get/<int:pk>/', views.comment_detail_get, name='comment-detail_get'),
    # path('comments/put/<int:pk>/', views.comment_detail_put, name='comment-detail_put'),
    # path('comments/delete/<int:pk>/', views.comment_detail_delete, name='comment-detail_delete'),

    # Reservation URLs
    # path('reservations/', views.reservation_list_create, name='reservation-list-create'),
    # path('reservations/<int:pk>/', views.reservation_detail, name='reservation-detail'),

    # Swagger/OpenAPI URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
