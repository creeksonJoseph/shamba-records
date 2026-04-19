import pytest


@pytest.mark.django_db
class TestAuth:
    def test_register_creates_user(self, api_client):
        res = api_client.post('/api/auth/register/', {
            'name': 'New User',
            'email': 'new@test.com',
            'password': 'testpass123',
            'role': 'agent',
        })
        assert res.status_code == 201

    def test_login_returns_tokens(self, api_client, admin_user):
        res = api_client.post('/api/auth/login/', {
            'email': 'admin@test.com',
            'password': 'testpass123',
        })
        assert res.status_code == 200
        assert 'access' in res.data
        assert 'refresh' in res.data
        assert res.data['user']['email'] == 'admin@test.com'

    def test_login_with_wrong_password(self, api_client, admin_user):
        res = api_client.post('/api/auth/login/', {
            'email': 'admin@test.com',
            'password': 'wrongpassword',
        })
        assert res.status_code == 400

    def test_me_returns_current_user(self, admin_client):
        res = admin_client.get('/api/auth/me/')
        assert res.status_code == 200
        assert res.data['email'] == 'admin@test.com'

    def test_me_requires_authentication(self, api_client):
        res = api_client.get('/api/auth/me/')
        assert res.status_code == 401

    def test_logout_blacklists_token(self, api_client, admin_user):
        # Get a token first
        login_res = api_client.post('/api/auth/login/', {
            'email': 'admin@test.com',
            'password': 'testpass123',
        })
        refresh_token = login_res.data['refresh']
        access_token = login_res.data['access']

        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        res = api_client.post('/api/auth/logout/', {'refresh': refresh_token})
        assert res.status_code == 205
