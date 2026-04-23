from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Plant, PlantUpdate
from .serializers import (
    PlantSerializer,
    PlantCreateSerializer,
    PlantUpdateSerializer,
    StageUpdateSerializer,
    FlagSerializer,
    ObservationSerializer,
)


class PlantViewSet(viewsets.ModelViewSet):
    """
    Admin: sees all plants.
    Agent: sees plants on their assigned fields only.
    Create: agents only (on their assigned fields).
    Stage updates & observations: agents only, via /stage/ and /updates/ actions.
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

    def _check_agent_only(self, request, plant):
        """Return 403 Response if the caller is not an agent assigned to this plant's field."""
        if request.user.role != 'agent':
            return Response(
                {'detail': 'Only field agents can perform this action.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if plant.field.assigned_agent != request.user:
            return Response(
                {'detail': 'You are not assigned to this field.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    @action(detail=True, methods=['patch'], url_path='stage')
    def update_stage(self, request, pk=None):
        """PATCH /api/plants/:id/stage/ — agents only: advance stage and append to audit log."""
        plant = self.get_object()

        denied = self._check_agent_only(request, plant)
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

    @action(detail=True, methods=['patch'], url_path='flag')
    def flag(self, request, pk=None):
        """
        PATCH /api/plants/:id/flag/ — agents only.
        Sets or clears a manual status override on the plant.
          override='at_risk'  — agent flags disease, pest damage, etc.
          override='healthy'  — agent confirms healthy despite overdue timeline.
          override=null       — clears override, reverts to automatic computation.
        An optional 'reason' is appended to the audit log.
        """
        plant = self.get_object()

        denied = self._check_agent_only(request, plant)
        if denied:
            return denied

        serializer = FlagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        override = serializer.validated_data['override']
        reason = serializer.validated_data.get('reason', '')

        plant.status_override = override  # None clears it
        plant.save()  # triggers PlantStatusService.compute_status

        # Log the flag action as an audit entry
        label = {
            'at_risk': 'Manually flagged as At Risk',
            'healthy': 'Manually marked as Healthy',
            None: 'Status override cleared — reverted to automatic',
        }.get(override, 'Status flag updated')
        observation_text = f"{label}. {reason}".strip(' .') if reason else label
        PlantUpdate.objects.create(
            plant=plant,
            agent=request.user,
            observation=observation_text,
        )

        return Response(PlantSerializer(plant).data)

    @action(detail=True, methods=['get', 'post'], url_path='updates')
    def updates(self, request, pk=None):
        """GET/POST /api/plants/:id/updates/ — history and observation-only entries."""
        plant = self.get_object()

        if request.method == 'GET':
            updates = plant.updates.select_related('agent').all()
            return Response(PlantUpdateSerializer(updates, many=True).data)

        # POST — agents only
        denied = self._check_agent_only(request, plant)
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
