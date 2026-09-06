from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))


class IsAgentUserRole(permissions.BasePermission):
    """
    Allows access only to Agent users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'AGENT')


class IsCustomerUserRole(permissions.BasePermission):
    """
    Allows access only to Customer users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CUSTOMER')


class IsAdminOrAgent(permissions.BasePermission):
    """
    Allows access to either Admin or Agent users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.role in ['ADMIN', 'AGENT'] or request.user.is_superuser
        ))


class IsOwnerOrAdminOrAgent(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit/view it,
    unless the user is an admin or an assigned agent.
    """
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True

        # Check if obj has customer attribute or is customer itself
        customer = getattr(obj, 'customer', None)
        if customer:
            if request.user.role == 'AGENT':
                # Agents can view customer policies/claims
                return True
            return customer.user == request.user

        if hasattr(obj, 'user'):
            return obj.user == request.user

        return False
