from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Field


class FieldSerializer(serializers.ModelSerializer):
    """Full read serializer with nested agent/creator names."""
    assigned_agent = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Field
        fields = ['id', 'name', 'location', 'assigned_agent', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class FieldCreateSerializer(serializers.ModelSerializer):
    """Write serializer — accepts assigned_agent as a UUID FK."""
    class Meta:
        model = Field
        fields = ['id', 'name', 'location', 'assigned_agent']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
