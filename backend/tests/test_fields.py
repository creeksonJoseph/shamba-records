import pytest
from django.contrib.auth import get_user_model
from apps.fields.models import Field

User = get_user_model()


@pytest.mark.django_db
class TestFields:
    def test_admin_can_create_field(self, admin_client, agent_user):
        res = admin_client.post('/api/fields/', {
            'name': 'New Field',
            'location': 'Mombasa, Kenya',
            'assigned_agent': str(agent_user.id),
        })
        assert res.status_code == 201
        assert res.data['name'] == 'New Field'

    def test_agent_cannot_create_field(self, agent_client):
        res = agent_client.post('/api/fields/', {
            'name': 'Unauthorized Field',
            'location': 'Somewhere',
        })
        assert res.status_code == 403

    def test_unauthenticated_cannot_list_fields(self, api_client):
        res = api_client.get('/api/fields/')
        assert res.status_code == 401

    def test_admin_sees_all_fields(self, admin_client, field):
        res = admin_client.get('/api/fields/')
        assert res.status_code == 200
        ids = [f['id'] for f in res.data['results']]
        assert str(field.id) in ids

    def test_agent_sees_only_their_assigned_field(self, admin_client, agent_client, agent_user, admin_user, db):
        # field assigned to agent_user (created via admin_client)
        field_mine = Field.objects.create(
            name='Mine', location='Nairobi', assigned_agent=agent_user, created_by=admin_user,
        )
        # Field assigned to someone else
        other = User.objects.create_user(email='other@test.com', password='pass', name='Other', role='agent')
        Field.objects.create(name='Not Mine', location='Kisumu', assigned_agent=other, created_by=admin_user)

        res = agent_client.get('/api/fields/')
        assert res.status_code == 200
        ids = [f['id'] for f in res.data['results']]
        assert str(field_mine.id) in ids
        assert len(ids) == 1

    def test_admin_can_delete_field(self, admin_client, field):
        res = admin_client.delete(f'/api/fields/{field.id}/')
        assert res.status_code == 204

    def test_agent_cannot_delete_field(self, agent_client, field):
        res = agent_client.delete(f'/api/fields/{field.id}/')
        assert res.status_code == 403
