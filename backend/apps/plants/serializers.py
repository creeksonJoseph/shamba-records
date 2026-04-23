from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Plant, PlantUpdate, STAGE_CHOICES


class PlantSummarySerializer(serializers.ModelSerializer):
    """Lightweight plant info embedded inside update entries."""
    field_name = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = ['id', 'crop_type', 'field_name']

    def get_field_name(self, obj):
        return obj.field.name if obj.field else None


class PlantUpdateSerializer(serializers.ModelSerializer):
    agent = UserSerializer(read_only=True)
    plant = PlantSummarySerializer(read_only=True)

    class Meta:
        model = PlantUpdate
        fields = ['id', 'plant', 'agent', 'new_stage', 'observation', 'created_at']
        read_only_fields = ['id', 'plant', 'agent', 'created_at']


class PlantSerializer(serializers.ModelSerializer):
    """Full read serializer including nested update history."""
    created_by = UserSerializer(read_only=True)
    updates = PlantUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Plant
        fields = [
            'id', 'field', 'created_by', 'crop_type', 'planting_date',
            'expected_days', 'stage', 'status', 'notes',
            'created_at', 'updated_at', 'updates',
        ]
        read_only_fields = ['id', 'status', 'created_by', 'created_at', 'updated_at']


class PlantCreateSerializer(serializers.ModelSerializer):
    """Write serializer for creating a new plant on a field."""
    class Meta:
        model = Plant
        fields = ['id', 'field', 'crop_type', 'planting_date', 'expected_days', 'notes', 'stage', 'status']
        read_only_fields = ['id', 'stage', 'status']

    def validate_field(self, field):
        user = self.context['request'].user
        if user.role == 'agent' and field.assigned_agent != user:
            raise serializers.ValidationError(
                'You can only create plants on fields assigned to you.'
            )
        return field

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['stage'] = 'planted'
        return super().create(validated_data)


class StageUpdateSerializer(serializers.Serializer):
    """Accepts a stage transition with an optional observation note."""
    new_stage = serializers.ChoiceField(choices=STAGE_CHOICES)
    observation = serializers.CharField(required=False, allow_blank=True, default='')


class ObservationSerializer(serializers.Serializer):
    """For POST /plants/:id/updates/ — observation without a stage change."""
    observation = serializers.CharField()
