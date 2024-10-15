from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import BookSerializer, CommentSerializer, UserSerializer
from .models import Book, Comment, User
from django.shortcuts import get_object_or_404

# ----------------- Book Views -----------------

@api_view(['GET', 'POST'])
def book_list_create(request):
    if request.method == 'GET':
        books = Book.objects.all()
        # Filtravimas pagal pavadinimą, autorių ar kategoriją
        title = request.GET.get('title')
        author = request.GET.get('author')
        category = request.GET.get('category')
        if title:
            books = books.filter(title__icontains=title)
        if author:
            books = books.filter(author__icontains=author)
        if category:
            books = books.filter(category__icontains=category)
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Tik bibliotekininkams ir administratoriams (šiuo metu nenaudojame leidimų)
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)

    if request.method == 'GET':
        serializer = BookSerializer(book)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Tik bibliotekininkams ir administratoriams
        serializer = BookSerializer(book, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Tik bibliotekininkams ir administratoriams
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- Comment Views -----------------

@api_view(['GET', 'POST'])
def comment_list_create(request):
    if request.method == 'GET':
        comments = Comment.objects.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Tik skaitytojams ir aukštesniems
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Čia priskiriame vartotoją
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def book_comments(request, book_id):
    book = get_object_or_404(Book, pk=book_id)
    comments = book.comments.all()
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
def comment_detail(request, pk):
    comment = get_object_or_404(Comment, pk=pk)

    if request.method == 'GET':
        serializer = CommentSerializer(comment)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Tik komentaro autoriui
        serializer = CommentSerializer(comment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Tik komentaro autoriui arba administratoriams
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- User Views -----------------

@api_view(['POST'])
def user_create(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['PUT', 'DELETE'])
def user_update_delete(request, pk):
    user = get_object_or_404(User, pk=pk)

    if request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def user_list(request):
    # Tik administratoriams
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
