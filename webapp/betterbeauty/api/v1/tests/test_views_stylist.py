import pytest

from django.urls import reverse

from django_dynamic_fixture import G
from rest_framework import status

from api.v1.stylist.views import ClientSearchView
from appointment.models import Appointment
from client.models import Client
from core.models import User
from core.types import UserRole
from salon.models import Stylist


class TestStylistView(object):

    def _create_and_authorize_user(self, client):
        user = G(
            User, email='email@example.com', first_name='Jane', last_name='McBob',
            role=UserRole.STYLIST
        )
        user.set_password('password')
        user.save()
        auth_url = reverse('api:v1:auth:get_jwt_token')
        data = client.post(
            auth_url, data={
                'email': 'email@example.com', 'password': 'password', 'role': UserRole.STYLIST
            }
        ).data
        token = data['token']
        return user, token

    @pytest.mark.django_db
    def test_stylist_get_with_existing_stylist(self, client):
        user, token = self._create_and_authorize_user(client)
        stylist = G(Stylist, user=user)
        profile_url = reverse('api:v1:stylist:profile')
        auth_header = 'Token {0}'.format(token)
        response = client.get(profile_url, data={}, HTTP_AUTHORIZATION=auth_header)
        assert(response.status_code == status.HTTP_200_OK)
        data = response.data
        assert(data['first_name'] == 'Jane')
        assert(data['id'] == stylist.id)

    @pytest.mark.django_db
    def test_stylist_get_without_existing_stylist(self, client):
        user, token = self._create_and_authorize_user(client)
        profile_url = reverse('api:v1:stylist:profile')
        auth_header = 'Token {0}'.format(token)
        response = client.get(profile_url, data={}, HTTP_AUTHORIZATION=auth_header)
        assert (response.status_code == status.HTTP_200_OK)
        data = response.data
        assert (not data['first_name'])
        assert ('id' not in data)


class TestClientSearchView(object):

    @pytest.mark.django_db
    def test_search_clients(self):
        stylist = G(Stylist)
        # stray_client
        user_1 = G(
            User,
            first_name='Jenny',
            last_name='McDonald',
            phone='123456',
            role=UserRole.CLIENT
        )
        G(
            Client,
            user=user_1
        )

        # client that our stylist has appointments with
        user_2 = G(
            User,
            first_name='Fred',
            last_name='McBob',
            phone='123457',
            role=UserRole.CLIENT
        )
        our_client = G(
            Client,
            user=user_2
        )
        G(Appointment, stylist=stylist, client=our_client)

        no_results = ClientSearchView()._search_clients(
            stylist, 'Jenny'
        )
        assert(no_results.count() == 0)
        results = ClientSearchView()._search_clients(
            stylist, 'Fred'
        )
        assert(results.count() == 1)
        assert(results.last() == our_client)

        results = ClientSearchView()._search_clients(
            stylist, 'Fred mc'
        )
        assert (results.count() == 1)
        assert (results.last() == our_client)

        results = ClientSearchView()._search_clients(
            stylist, 'mcbob fr'
        )
        assert (results.count() == 1)
        assert (results.last() == our_client)
