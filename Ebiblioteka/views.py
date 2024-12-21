from .serializers import (
    BookSerializer,
    CommentSerializer,
    UserSerializer,
    CategorySerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework.status import HTTP_204_NO_CONTENT
from .models import Book, Comment, Category
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
User = get_user_model()
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import UserSession
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from .models import UserSession
from django.utils.crypto import get_random_string
from rest_framework.response import Response
from .permissions import (
    IsAdminOrSelfComment,
    AllowAny, IsAdmin, IsAdminOrLibrarian,
    IsAdminOrSelfOrSelf,
    IsAdminOrSelfOrLibrarian
)
class UserDetailView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=401)

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": request.user.role,
        })

# views.py
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = serializer.user

        refresh_token = data['refresh']
        access_token = data['access']
        session_key = data['session_key']

        # Return the access token in the response body only
        response = Response({
            'access': access_token,
            'role': user.role  # If you want to pass role back to client
        }, status=status.HTTP_200_OK)

        # Keep the refresh token and session_key in secure, HttpOnly cookies
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            secure=True,
            samesite='Strict',
        )
        response.set_cookie(
            'session_key',
            session_key,
            httponly=True,
            secure=True,
            samesite='Strict',
        )

        # REMOVE THE LINE SETTING THE ACCESS COOKIE
        # response.set_cookie(
        #     'access_token',
        #     access_token,
        #     httponly=True,
        #     secure=True,
        #     samesite='Strict',
        # )

        return response


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        # We still read the refresh token and session_key from cookies
        refresh_token = request.COOKIES.get('refresh_token')
        session_key = request.COOKIES.get('session_key')

        if not refresh_token or not session_key:
            return Response({'error': 'Authentication credentials were not provided.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={
            'refresh': refresh_token,
            'session_key': session_key
        })
        serializer.is_valid(raise_exception=True)

        # The serializer returns a new access (and possibly refresh) token
        data = serializer.validated_data

        # Remove the refresh token from the response body to enforce using cookies only
        new_refresh_token = data.get('refresh')
        if 'refresh' in data:
            del data['refresh']

        response = Response(data, status=status.HTTP_200_OK)

        # Update the refresh token cookie if a new one was rotated
        if new_refresh_token:
            response.set_cookie(
                'refresh_token',
                new_refresh_token,
                httponly=True,
                secure=True,
                samesite='Strict',
            )

        # DO NOT set access token in cookie
        # The access token is only returned in the response body
        # response.set_cookie('access_token', ... ) # <- Removed

        return response

import logging

logger = logging.getLogger(__name__)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache  # Blacklist storage
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from .models import UserSession

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.core.cache import cache
from .models import UserSession
import logging

logger = logging.getLogger(__name__)
class smthsmth(APIView):
    def get(self, request):
        user_role = 'admin' if request.user.role == 'admin' else 'librarian'
        return Response({
            "role": user_role
        })


class LogoutView(APIView):
    def post(self, request):
        print("=== [LOGOUT VIEW] POST method triggered ===")

        # 1. Refresh token & session_key from cookies
        refresh_token = request.COOKIES.get('refresh_token')
        session_key = request.COOKIES.get('session_key')

        # 2. Access token from the Authorization header
        auth_header = request.headers.get('Authorization')
        access_token_raw = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token_raw = auth_header.split(' ')[1]

        print(f"=== Debug: refresh_token = {refresh_token}")
        print(f"=== Debug: session_key   = {session_key}")
        print(f"=== Debug: auth_header   = {auth_header}")
        print(f"=== Debug: access_token_raw = {access_token_raw}")

        if not refresh_token:
            print("=== Debug: Missing refresh token. Returning 400. ===")
            return Response({'error': 'Missing refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

        if not session_key:
            print("=== Debug: Missing session key. Returning 400. ===")
            return Response({'error': 'Missing session key.'}, status=status.HTTP_400_BAD_REQUEST)

        if not access_token_raw:
            print("=== Debug: Missing access token. Returning 400. ===")
            return Response({'error': 'Missing access token.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            print("=== Debug: Parsing access token ===")
            access_token = AccessToken(access_token_raw)
            access_jti = access_token['jti']
            access_exp = access_token['exp']
            access_iat = access_token['iat']
            print(f"=== Debug: Access Token Info: jti={access_jti}, exp={access_exp}, iat={access_iat} ===")

            print("=== Debug: Blacklisting access token in cache ===")
            cache.set(
                f"blacklist_{access_jti}",
                "blacklisted",
                timeout=access_exp - int(access_iat)
            )

            print("=== Debug: Parsing refresh token ===")
            refresh = RefreshToken(refresh_token)
            refresh_jti = refresh['jti']
            refresh_exp = refresh['exp']
            refresh_iat = refresh['iat']
            print(f"=== Debug: Refresh Token Info: jti={refresh_jti}, exp={refresh_exp}, iat={refresh_iat} ===")

            print("=== Debug: Blacklisting refresh token in cache ===")
            cache.set(
                f"blacklist_{refresh_jti}",
                "blacklisted",
                timeout=refresh_exp - int(refresh_iat)
            )

            print("=== Debug: Retrieving user session from DB ===")
            session = UserSession.objects.get(session_key=session_key, expired=False)
            print(f"=== Debug: Found session (ID={session.id}). Marking as expired ===")
            session.expired = True
            session.save()

            print("=== Debug: Preparing logout response. Deleting cookies. ===")
            response = Response({'success': 'Logged out successfully.'}, status=status.HTTP_200_OK)
            response.delete_cookie('session_key')
            response.delete_cookie('refresh_token')

            print("=== Debug: Logout successful. Returning 200 OK. ===")
            return response

        except UserSession.DoesNotExist:
            print("=== Debug: Session does not exist or is already expired. Returning 400. ===")
            logger.error("Session does not exist or already expired.")
            return Response({'error': 'Invalid or expired session key.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"=== Debug: Exception caught: {str(e)} ===")
            logger.error(f"Error during logout: {str(e)}")
            return Response({'error': 'An error occurred during logout.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ----------------- Book Views -----------------
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow any for GET, check manually for POST
def book_list_get(request):
    books = Book.objects.all()
    # Filtering by title, author, or category name
    title = request.GET.get('title')
    author = request.GET.get('author')
    category_name = request.GET.get('category')
    if title:
        books = books.filter(title__icontains=title)
    if author:
        books = books.filter(author__icontains=author)
    if category_name:
        books = books.filter(category__name__icontains=category_name)
    serializer = BookSerializer(books, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdmin])  # Allow any for GET, check manually for POST
def book_list_create(request):
    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def book_detail_get(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if request.method == 'GET':
        serializer = BookSerializer(book)
        return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdmin])
def book_detail_put(request, pk):
    book = get_object_or_404(Book, pk=pk)
    serializer = BookSerializer(book, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdmin])
def book_detail_delete(request, pk):
    book = get_object_or_404(Book, pk=pk)
    book.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- Comment Views -----------------

# ----------------- Comment Views -----------------
@api_view(['GET'])
@permission_classes([AllowAny])
def comment_list_get(request, cat_id, book_id):
    # First, ensure the book exists under the given category
    book = get_object_or_404(Book, pk=book_id, category_id=cat_id)

    # Now filter comments by this specific book
    comments = Comment.objects.filter(book=book)
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminOrSelfOrLibrarian])
def comment_list_create(request, cat_id, book_id):
    # Ensure the book exists under the given category
    book = get_object_or_404(Book, pk=book_id, category_id=cat_id)

    # When creating a new comment, we must associate it with the correct book.
    # Include the `book` in the serializer's save method.
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, book=book)  # Assign the user and the book
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAdminOrSelfOrLibrarian])
def comment_detail_get(request, cat_id, book_id, pk):
    # Ensure the book exists under the given category
    book = get_object_or_404(Book, pk=book_id, category_id=cat_id)

    # Ensure the comment belongs to this book
    comment = get_object_or_404(Comment, pk=pk, book=book)
    serializer = CommentSerializer(comment)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdminOrSelfComment])
def comment_detail_put(request, cat_id, book_id, pk):
    # Ensure the book exists under the given category
    book = get_object_or_404(Book, pk=book_id, category_id=cat_id)

    # Ensure the comment belongs to this book
    comment = get_object_or_404(Comment, pk=pk, book=book)
    serializer = CommentSerializer(comment, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Comment updated successfully.', 'data': serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrSelfComment])
def comment_detail_delete(request, cat_id, book_id, pk):
    # Ensure the book exists under the given category
    book = get_object_or_404(Book, pk=book_id, category_id=cat_id)

    # Ensure the comment belongs to this book
    comment = get_object_or_404(Comment, pk=pk, book=book)

    # Perform deletion
    comment.delete()
    return Response({'detail': 'Comment deleted successfully.'}, status=HTTP_204_NO_CONTENT)
# ----------------- User Views -----------------
@api_view(['GET'])
@permission_classes([AllowAny])
def user_list_get(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([AllowAny])
def user_create(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'User created successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminOrSelfOrSelf])
def user_detail_get(request, pk):
    user = get_object_or_404(User, pk=pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdminOrSelfOrSelf])
def user_update_put(request, pk):
    user = get_object_or_404(User, pk=pk)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'User updated successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrSelfOrSelf])
def user_delete(request, pk):
    user = get_object_or_404(User, pk=pk)
    user.delete()
    return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ----------------- Category Views -----------------

@api_view(['GET'])
@permission_classes([AllowAny])  # Overrides global settings for this view
def category_list_get(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdmin])
def category_list_create(request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Category created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def category_detail_get(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdmin])
def category_detail_put(request, pk):
    category = get_object_or_404(Category, pk=pk),
    serializer = CategorySerializer(category, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Category updated successfully.'})
    else:
        missing_required_fields = []
        for field, errors in serializer.errors.items():
            for error in errors:
                if error.code == 'blank':
                    missing_required_fields.append(field)
        if missing_required_fields:
             # Return 422 Unprocessable Entity when required fields are missing
            return Response(
                {'error': 'Unprocessable Entity', 'details': serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
             )
        else:
             # Return 400 Bad Request for other validation errors
             return Response(
                {'error': 'Bad Request', 'details': serializer.errors},
                 status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['DELETE'])
@permission_classes([IsAdmin])
def category_detail_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    category.delete()
    return Response({'detail': 'Category deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)