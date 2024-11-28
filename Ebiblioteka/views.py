from .serializers import (
    BookSerializer,
    CommentSerializer,
    UserSerializer,
    CategorySerializer,
    CustomTokenObtainPairSerializer
)
from .models import Book, Comment, Category
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAuthenticatedOrReadOnly
)
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import BasePermission

User = get_user_model()
from rest_framework_simplejwt.views import TokenObtainPairView
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
# Custom permission classes
class IsAdminOrLibrarian(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'librarian']

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user or request.user.role == 'admin'






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
@permission_classes([AllowAny])  # Allow any for GET, check manually for POST
def book_list_create(request):
    if not request.user.is_authenticated or request.user.role not in ['admin', 'librarian']:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def book_detail_get(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if request.method == 'GET':
        serializer = BookSerializer(book)
        return Response(serializer.data)

@api_view(['PUT'])
def book_detail_put(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if not request.user.is_authenticated or request.user.role not in ['admin', 'librarian']:
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = BookSerializer(book, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def book_detail_delete(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if not request.user.is_authenticated or request.user.role not in ['admin', 'librarian']:
         return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    book.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- Comment Views -----------------

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def comment_list_get(request):
    comments = Comment.objects.all()
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def comment_list_create(request):
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Assign the authenticated user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






# Svečias gali peržiūrėti visų 3 lygių objektus. Pagal rolę galintis kurti objektus gali tai daryti. Sukūręs objektus gali trinti, redaguoti. Admingas gali arba viską, arba trinti redaguoti kitų žmonių objektus o kad gaėlėtų pridėti jam pridedi ir userrio role






@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOwnerOrAdmin])
def comment_detail_get(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    # Check object permissions // Pasiemi bld i6 tokeno info, ziuri tada kap esas roles i jei role atitink kurej, ziur ar tas pats ir yr pagal id + admin1 pa-i8r jei ten sansa tai tada id nesvarbu i leidi trint
    if not request.user == comment.user and request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = CommentSerializer(comment)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsOwnerOrAdmin])
def comment_detail_put(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    # Check object permissions // Pasiemi bld i6 tokeno info, ziuri tada kap esas roles i jei role atitink kurej, ziur ar tas pats ir yr pagal id + admin1 pa-i8r jei ten sansa tai tada id nesvarbu i leidi trint
    if not request.user == comment.user and request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = CommentSerializer(comment, data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)  # Ensure the user is correctly set
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsOwnerOrAdmin])
def comment_detail_delete(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    # Check object permissions // Pasiemi bld i6 tokeno info, ziuri tada kap esas roles i jei role atitink kurej, ziur ar tas pats ir yr pagal id + admin1 pa-i8r jei ten sansa tai tada id nesvarbu i leidi trint
    if not request.user == comment.user and request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- User Views -----------------

@api_view(['POST'])
@permission_classes([AllowAny])
def user_create(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'User created successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_get(request, pk):
    if request.user.pk != pk and request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    user = get_object_or_404(User, pk=pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def user_update_put(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.user.pk != pk and request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'User updated successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def user_update_delete(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.user.pk != pk and request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    user.delete()
    return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list_get(request):
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

# # ----------------- Reservation Views -----------------
#
# @api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
# def reservation_list_create(request):
#     if request.method == 'GET':
#         # Allow users to see their own reservations or all if they are admin/librarian
#         if request.user.role in ['admin', 'librarian']:
#             reservations = Reservation.objects.all()
#         else:
#             reservations = Reservation.objects.filter(user=request.user)
#         serializer = ReservationSerializer(reservations, many=True)
#         return Response(serializer.data)
#     elif request.method == 'POST':
#         serializer = ReservationSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(user=request.user)  # Automatically assign the authenticated user
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
# @api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def reservation_detail(request, pk):
#     reservation = get_object_or_404(Reservation, pk=pk)
#     if not (request.user == reservation.user or request.user.role in ['admin', 'librarian']):
#         return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
#     if request.method == 'GET':
#         serializer = ReservationSerializer(reservation)
#         return Response(serializer.data)
#     elif request.method == 'PUT':
#         serializer = ReservationSerializer(reservation, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'detail': 'Reservation updated successfully.'})
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     elif request.method == 'DELETE':
#         reservation.delete()
#         return Response({'detail': 'Reservation deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

# ----------------- Category Views -----------------

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def category_list_get(request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def category_list_create(request):
        if not request.user.role in ['admin', 'librarian']:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Category created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def category_detail_get(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticatedOrReadOnly])
def category_detail_put(request, pk):
    category = get_object_or_404(Category, pk=pk),
    if not request.user.role in ['admin', 'librarian'] :#id from token :
        return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
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
@permission_classes([IsAuthenticatedOrReadOnly])
def category_detail_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if not request.user.role in ['admin', 'librarian'] and category.fk_userID == 1 : #id from token :
         return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    category.delete()
    return Response({'detail': 'Category deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)