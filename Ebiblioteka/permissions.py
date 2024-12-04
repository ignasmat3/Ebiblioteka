from rest_framework.permissions import BasePermission

class IsAdminOrSelf(BasePermission):
    def has_permission(self, request, view):
        if request.user.role == 'admin':
            return True
        pk = view.kwargs.get('pk') or request.parser_context['kwargs'].get('pk')
        return request.user.is_authenticated and request.user.pk == int(pk)

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsLibrarian(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'librarian'

class IsAdminOrLibrarian(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'librarian']
