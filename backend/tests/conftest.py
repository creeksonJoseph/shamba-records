import pytest
from datetime import date, timedelta
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.fields.models import Field
from apps.plants.models import Plant

User = get_user_model()


# ---- Clients ----------------------------------------------------------------

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='admin@test.com',
        password='testpass123',
        name='Test Admin',
        role='admin',
    )


@pytest.fixture
def agent_user(db):
    return User.objects.create_user(
        email='agent@test.com',
        password='testpass123',
        name='Test Agent',
        role='agent',
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def agent_client(api_client, agent_user):
    api_client.force_authenticate(user=agent_user)
    return api_client


# ---- Domain objects ---------------------------------------------------------

@pytest.fixture
def field(db, admin_user, agent_user):
    return Field.objects.create(
        name='Test Field',
        location='Nairobi, Kenya',
        assigned_agent=agent_user,
        created_by=admin_user,
    )


@pytest.fixture
def plant(db, field, agent_user):
    return Plant.objects.create(
        field=field,
        created_by=agent_user,
        crop_type='Maize',
        planting_date=date.today() - timedelta(days=30),
        expected_days=90,
        stage='growing',
    )
