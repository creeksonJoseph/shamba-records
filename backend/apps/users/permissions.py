from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with the admin role."""

    message = 'Only admins can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsAgent(BasePermission):
    """Allow access only to users with the agent role."""

    message = 'Only agents can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'agent'
        )
