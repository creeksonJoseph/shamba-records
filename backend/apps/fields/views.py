from rest_framework import viewsets, permissions
from .models import Field
from .serializers import FieldSerializer, FieldCreateSerializer
from apps.users.permissions import IsAdmin


class FieldViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD on all fields.
    Agent: read-only, scoped to their assigned fields.
    """

    def get_queryset(self):
        user = self.request.user
        qs = Field.objects.select_related('assigned_agent', 'created_by')
        if user.role == 'admin':
            return qs.all()
        return qs.filter(assigned_agent=user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FieldCreateSerializer
        return FieldSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
