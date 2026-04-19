import pytest


@pytest.mark.django_db
class TestDashboard:
    def test_unauthenticated_is_denied(self, api_client):
        res = api_client.get('/api/dashboard/')
        assert res.status_code == 401

    def test_admin_dashboard_returns_all_fields(self, admin_client, plant):
        res = admin_client.get('/api/dashboard/')
        assert res.status_code == 200
        assert res.data['total_fields'] >= 1
        assert res.data['total_plants'] >= 1

    def test_admin_dashboard_has_required_keys(self, admin_client, plant):
        res = admin_client.get('/api/dashboard/')
        for key in ['total_fields', 'total_plants', 'by_status', 'by_stage', 'at_risk_plants', 'recent_updates']:
            assert key in res.data

    def test_agent_dashboard_scoped_to_their_fields(self, agent_client, plant):
        res = agent_client.get('/api/dashboard/')
        assert res.status_code == 200
        # plant is on agent_user's field, so it should appear
        assert res.data['total_plants'] == 1

    def test_by_status_sums_are_correct(self, agent_client, plant):
        res = agent_client.get('/api/dashboard/')
        total = sum(res.data['by_status'].values())
        assert total == res.data['total_plants']

    def test_by_stage_sums_are_correct(self, agent_client, plant):
        res = agent_client.get('/api/dashboard/')
        total = sum(res.data['by_stage'].values())
        assert total == res.data['total_plants']
