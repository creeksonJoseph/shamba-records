from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
            fields = Field.objects.all()
            plants = Plant.objects.select_related('field', 'created_by').all()
        else:
            fields = Field.objects.filter(assigned_agent=user)
            plants = Plant.objects.filter(
                field__assigned_agent=user
            ).select_related('field', 'created_by')

        by_status = {
            'active': plants.filter(status='active').count(),
            'at_risk': plants.filter(status='at_risk').count(),
            'completed': plants.filter(status='completed').count(),
        }
        by_stage = {
            'planted': plants.filter(stage='planted').count(),
            'growing': plants.filter(stage='growing').count(),
            'ready': plants.filter(stage='ready').count(),
            'harvested': plants.filter(stage='harvested').count(),
        }

        at_risk_plants = plants.filter(status='at_risk')
        recent_updates = (
            PlantUpdate.objects
            .filter(plant__in=plants)
            .select_related('plant', 'agent')
            .order_by('-created_at')[:5]
        )

        return Response({
            'total_fields': fields.count(),
            'total_plants': plants.count(),
            'by_status': by_status,
            'by_stage': by_stage,
            'at_risk_plants': PlantSerializer(at_risk_plants, many=True).data,
            'recent_updates': PlantUpdateSerializer(recent_updates, many=True).data,
        })
