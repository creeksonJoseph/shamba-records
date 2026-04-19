from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Plant, PlantUpdate
from .serializers import (
    PlantSerializer,
    PlantCreateSerializer,
    PlantUpdateSerializer,
    StageUpdateSerializer,
    ObservationSerializer,
)


class PlantViewSet(viewsets.ModelViewSet):
    """
    Admin: sees all plants.
    Agent: sees plants on their assigned fields only.
    Create: agents only (on their assigned fields).
    Stage updates: via the custom /stage/ action.
    Observations: via the /updates/ action.
    """

    def get_queryset(self):
        user = self.request.user
        qs = Plant.objects.select_related('field', 'created_by').prefetch_related('updates__agent')
        if user.role == 'admin':
            return qs.all()
        return qs.filter(field__assigned_agent=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return PlantCreateSerializer
        return PlantSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def _check_agent_ownership(self, request, plant):
        """Return 403 Response if agent doesn't own this plant's field."""
        if request.user.role == 'agent' and plant.field.assigned_agent != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    @action(detail=True, methods=['patch'], url_path='stage')
    def update_stage(self, request, pk=None):
        """PATCH /api/plants/:id/stage/ — advance stage and append to audit log."""
        plant = self.get_object()

        denied = self._check_agent_ownership(request, plant)
        if denied:
            return denied

        serializer = StageUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_stage = serializer.validated_data['new_stage']
        observation = serializer.validated_data.get('observation', '')

        # Append audit entry
        PlantUpdate.objects.create(
            plant=plant,
            agent=request.user,
            new_stage=new_stage,
            observation=observation,
        )

        # Persist new stage (triggers status recompute in save())
        plant.stage = new_stage
        if observation:
            plant.notes = observation
        plant.save()

        return Response(PlantSerializer(plant).data)

    @action(detail=True, methods=['get', 'post'], url_path='updates')
    def updates(self, request, pk=None):
        """GET/POST /api/plants/:id/updates/ — history and observation-only entries."""
        plant = self.get_object()

        if request.method == 'GET':
            updates = plant.updates.select_related('agent').all()
            return Response(PlantUpdateSerializer(updates, many=True).data)

        # POST
        denied = self._check_agent_ownership(request, plant)
        if denied:
            return denied

        serializer = ObservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update = PlantUpdate.objects.create(
            plant=plant,
            agent=request.user,
            observation=serializer.validated_data['observation'],
        )
        return Response(PlantUpdateSerializer(update).data, status=status.HTTP_201_CREATED)
