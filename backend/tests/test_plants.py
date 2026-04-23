import pytest
from datetime import date, timedelta
from apps.plants.services import PlantStatusService
from apps.plants.models import Plant


# ---- Unit tests for PlantStatusService (no DB needed) -----------------------

class TestPlantStatusService:
    """Pure unit tests — no DB, just plain Python objects."""

    def _make_plant(self, stage, days_elapsed, expected_days):
        """Build a mock plant without saving to DB."""
        class MockPlant:
            pass
        p = MockPlant()
        p.stage = stage
        p.planting_date = date.today() - timedelta(days=days_elapsed)
        p.expected_days = expected_days
        return p

    def test_harvested_stage_returns_completed(self):
        p = self._make_plant('harvested', 100, 90)
        assert PlantStatusService.compute_status(p) == 'completed'

    def test_overdue_by_more_than_20_percent_returns_at_risk(self):
        # 109 days elapsed, 90 expected = 121% progress → at_risk
        p = self._make_plant('growing', 109, 90)
        assert PlantStatusService.compute_status(p) == 'at_risk'

    def test_exactly_120_percent_is_at_risk(self):
        # 108 days / 90 = 1.2 exactly → NOT > 1.2, so still active
        p = self._make_plant('growing', 108, 90)
        assert PlantStatusService.compute_status(p) == 'active'

    def test_within_window_returns_active(self):
        p = self._make_plant('growing', 30, 90)
        assert PlantStatusService.compute_status(p) == 'active'

    def test_ready_stage_within_window_returns_active(self):
        p = self._make_plant('ready', 80, 90)
        assert PlantStatusService.compute_status(p) == 'active'


# ---- Integration tests against the API -------------------------------------

@pytest.mark.django_db
class TestPlantAPI:
    def test_agent_can_create_plant_on_assigned_field(self, agent_client, field):
        res = agent_client.post('/api/plants/', {
            'field': str(field.id),
            'crop_type': 'Kale',
            'planting_date': '2026-03-01',
            'expected_days': 60,
        })
        assert res.status_code == 201
        assert res.data['crop_type'] == 'Kale'
        assert res.data['stage'] == 'planted'

    def test_agent_cannot_create_plant_on_unassigned_field(self, agent_client, admin_user, db):
        from django.contrib.auth import get_user_model
        from apps.fields.models import Field
        User = get_user_model()
        other_agent = User.objects.create_user(email='o@test.com', password='pass', name='O', role='agent')
        unassigned_field = Field.objects.create(
            name='Other', location='Mombasa', assigned_agent=other_agent, created_by=admin_user
        )
        res = agent_client.post('/api/plants/', {
            'field': str(unassigned_field.id),
            'crop_type': 'Maize',
            'planting_date': '2026-03-01',
            'expected_days': 90,
        })
        assert res.status_code == 400  # validation error

    def test_agent_can_update_stage(self, agent_client, plant):
        res = agent_client.patch(f'/api/plants/{plant.id}/stage/', {
            'new_stage': 'ready',
            'observation': 'Crops looking great!',
        })
        assert res.status_code == 200
        assert res.data['stage'] == 'ready'

    def test_stage_update_creates_audit_log_entry(self, agent_client, plant):
        agent_client.patch(f'/api/plants/{plant.id}/stage/', {'new_stage': 'ready'})
        plant.refresh_from_db()
        assert plant.updates.count() == 1
        assert plant.updates.first().new_stage == 'ready'

    def test_status_recomputed_after_stage_to_harvested(self, agent_client, plant):
        agent_client.patch(f'/api/plants/{plant.id}/stage/', {'new_stage': 'harvested'})
        plant.refresh_from_db()
        assert plant.status == 'completed'

    def test_admin_sees_all_plants(self, admin_client, plant):
        res = admin_client.get('/api/plants/')
        assert res.status_code == 200
        ids = [p['id'] for p in res.data]
        assert str(plant.id) in ids

    def test_agent_can_post_observation(self, agent_client, plant):
        res = agent_client.post(f'/api/plants/{plant.id}/updates/', {
            'observation': 'Spotted some yellowing on the lower leaves.',
        })
        assert res.status_code == 201
        assert res.data['observation'] == 'Spotted some yellowing on the lower leaves.'

    def test_get_updates_history(self, agent_client, plant):
        # Post two observations
        agent_client.post(f'/api/plants/{plant.id}/updates/', {'observation': 'First log'})
        agent_client.post(f'/api/plants/{plant.id}/updates/', {'observation': 'Second log'})
        res = agent_client.get(f'/api/plants/{plant.id}/updates/')
        assert res.status_code == 200
        assert len(res.data) == 2
