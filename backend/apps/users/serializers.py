from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """Lean serializer — safe to nest inside Field/Plant serializers without N+1."""
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserDetailSerializer(UserSerializer):
    """Extended serializer for the /users/ endpoint — includes assigned_fields."""
    assigned_fields = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['assigned_fields']
        read_only_fields = UserSerializer.Meta.read_only_fields + ['assigned_fields']

    def get_assigned_fields(self, obj):
        if obj.role != 'agent':
            return []
        return [
            {'id': str(f.id), 'name': f.name}
            for f in obj.assigned_fields.all()
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['name', 'email', 'password', 'role']

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '').lower()
        user = authenticate(email=email, password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been disabled.')
        data['user'] = user
        return data
