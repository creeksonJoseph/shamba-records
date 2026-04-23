from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from apps.plants.models import Plant, PlantUpdate
from apps.plants.serializers import PlantSerializer, PlantUpdateSerializer
from apps.fields.models import Field


class DashboardView(APIView):
    """
    GET /api/dashboard/

    Returns a role-appropriate summary:
    - Admin: aggregates across ALL fields and plants
    - Agent: aggregates across only their assigned fields/plants
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'admin':
            fields_qs = Field.objects.all()
            plants_qs = Plant.objects.all()
        else:
            fields_qs = Field.objects.filter(assigned_agent=user)
            plants_qs = Plant.objects.filter(field__assigned_agent=user)

        # --- Counts: 2 GROUP BY queries instead of 7 COUNT queries ---
        total_fields = fields_qs.count()
        total_plants = plants_qs.count()

        status_counts = {
            row['status']: row['n']
            for row in plants_qs.values('status').annotate(n=Count('id'))
        }
        stage_counts = {
            row['stage']: row['n']
            for row in plants_qs.values('stage').annotate(n=Count('id'))
        }

        by_status = {
            'active': status_counts.get('active', 0),
            'at_risk': status_counts.get('at_risk', 0),
            'completed': status_counts.get('completed', 0),
        }
        by_stage = {
            'planted': stage_counts.get('planted', 0),
            'growing': stage_counts.get('growing', 0),
            'ready': stage_counts.get('ready', 0),
            'harvested': stage_counts.get('harvested', 0),
        }

        # At-risk plants — prefetch updates for the serializer
        at_risk_plants = (
            plants_qs
            .filter(status='at_risk')
            .select_related('field', 'created_by')
            .prefetch_related('updates__agent')
        )

        recent_updates = (
            PlantUpdate.objects
            .filter(plant__in=plants_qs)
            .select_related('plant', 'plant__field', 'agent')
            .order_by('-created_at')[:5]
        )

        return Response({
            'total_fields': total_fields,
            'total_plants': total_plants,
            'by_status': by_status,
            'by_stage': by_stage,
            'at_risk_plants': PlantSerializer(at_risk_plants, many=True).data,
            'recent_updates': PlantUpdateSerializer(recent_updates, many=True).data,
        })
