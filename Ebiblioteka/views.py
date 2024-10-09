
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import BookSerializer
from .models import Book


@api_view(['GET'])
def get_book(request):
    books = Book.objects.all()
    serializers = BookSerializer(books, many=True).data
    return Response(serializers)

@api_view(['POST'])
def create_book(request):
    data = request.data
    serializers = BookSerializer(data = data)
    if serializers.is_valid():
        serializers.save()
        return Response(serializers.data, status=status.HTTP_201_CREATED)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
