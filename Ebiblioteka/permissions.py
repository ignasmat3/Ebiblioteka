from django.core.cache import cache
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import PermissionDenied
from .models import Comment
from .models import User
import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied

def get_role_from_token(request):
    """
    Extract the role from the access token.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise PermissionDenied("Authorization header missing.")

    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload.get('role')
    except jwt.ExpiredSignatureError:
        raise PermissionDenied("Token has expired.")
    except jwt.InvalidTokenError:
        raise PermissionDenied("Invalid token.")

def is_token_blacklisted(request):
    # Extract token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return False

    try:
        token = auth_header.split(' ')[1]
        jti = AccessToken(token)['jti']
        return cache.get(f"blacklist_{jti}") is not None
    except Exception:
        return True  # Treat invalid/missing tokens as blacklisted for security


class AllowAny(BasePermission):
    def has_permission(self, request, view):
        return True


class IsAdminOrSelfOrLibrarian(BasePermission):
    def has_permission(self, request, view):
        if is_token_blacklisted(request):
            raise PermissionDenied("Token is blacklisted.")

        if request.user.role in ['admin', 'librarian']:
            return True
        pk = view.kwargs.get('pk') or request.parser_context['kwargs'].get('pk')
        return request.user.is_authenticated and request.user.pk == int(pk)

class IsAdminOrSelfOrSelf(BasePermission):
    """
    Permission class to allow access to admins or the owner of a resource.
    """
    def has_permission(self, request, view):
        if is_token_blacklisted(request):
            raise PermissionDenied("Token is blacklisted.")

        # Allow admins
        if request.user.role == 'admin':
            return True

        # Retrieve the resource by ID from the URL kwargs
        pk = view.kwargs.get('pk')  # Replace 'pk' with the appropriate URL parameter name if necessary
        if not pk:
            raise PermissionDenied("Resource ID not found in the request.")

        # Fetch the resource and check ownership
        try:
            resource = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise PermissionDenied("Resource not found.")

        # Check if the current user is the owner of the resource
        return resource == request.user

class IsAdminOrSelfComment(BasePermission):
    def has_permission(self, request, view):
        # Check if the token is blacklisted
        if is_token_blacklisted(request):
            raise PermissionDenied("Token is blacklisted.")

        # Admins can access any comment
        if request.user.role == 'admin':
            return True

        # Fetch `comment_id` from the URL parameters
        comment_id = view.kwargs.get('pk')  # `pk` is the parameter from the URL pattern

        if not comment_id:
            raise PermissionDenied("Comment ID not found in the request.")

        # Check if the comment belongs to the user
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise PermissionDenied("Comment not found.")

        return comment.user.id == request.user.id


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        role = get_role_from_token(request)
        return role == 'admin'


class IsLibrarian(BasePermission):
    def has_permission(self, request, view):
        if is_token_blacklisted(request):
            raise PermissionDenied("Token is blacklisted.")

        return request.user.role == 'librarian'


class IsAdminOrLibrarian(BasePermission):
    def has_permission(self, request, view):
        if is_token_blacklisted(request):
            raise PermissionDenied("Token is blacklisted.")

        return request.user.role in ['admin', 'librarian']