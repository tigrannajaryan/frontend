from django.db import transaction
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.v1.auth.constants import ROLES_WITH_ALLOWED_LOGIN
from api.v1.client.serializers import ClientSerializer
from api.v1.stylist.serializers import StylistProfileStatusSerializer, StylistSerializer
from core.choices import USER_ROLE
from core.models import User
from core.types import FBAccessToken, FBUserID, UserRole
from core.utils.facebook import get_or_create_facebook_user
from salon.utils import create_stylist_profile_for_user


class CreateProfileMixin(object):
    def create_profile_for_user(self, user: User) -> None:
        assert user.role in ROLES_WITH_ALLOWED_LOGIN
        if user.role == UserRole.STYLIST:
            create_stylist_profile_for_user(user=user)
        # TODO: Implement creating a client profile similar to stylist


class UserRegistrationSerializer(CreateProfileMixin, serializers.Serializer):
    email = serializers.EmailField(required=True, write_only=True)
    password = serializers.CharField(required=True, write_only=True)
    role = serializers.ChoiceField(required=True, write_only=True, choices=USER_ROLE)

    def clear_email(self, email: str) -> str:
        return email.lower().strip()

    def validate_email(self, email: str):
        if User.objects.filter(email__iexact=email.strip()).exists():
            raise ValidationError(_(
                'This email is already taken'
            ))
        return email

    def validate_role(self, role: UserRole) -> UserRole:
        if role not in ROLES_WITH_ALLOWED_LOGIN:
            raise ValidationError('Incorrect user role')
        return role

    def save(self, **kwargs) -> User:
        email = self.validated_data['email']
        password = self.validated_data['password']
        role = self.validated_data['role']
        with transaction.atomic():
            user = User.objects.create_user(email=email, password=password, role=role)
            self.create_profile_for_user(user=user)
        return user


class AuthTokenSerializer(serializers.Serializer):
    token = serializers.CharField(read_only=True)
    expires_in = serializers.IntegerField(read_only=True)
    profile = serializers.SerializerMethodField()
    profile_status = serializers.SerializerMethodField()
    role = serializers.ChoiceField(read_only=True, choices=USER_ROLE)

    def get_profile(self, data):
        user = self.context['user']
        if user.role == UserRole.STYLIST:
            return StylistSerializer(getattr(user, 'stylist', None)).data
        elif user.role == UserRole.CLIENT:
            return ClientSerializer(getattr(user, 'client', None)).data
        return []

    def get_profile_status(self, data):
        user = self.context['user']
        if user.role == UserRole.STYLIST:
            return StylistProfileStatusSerializer(getattr(user, 'stylist', None)).data
        return []


class FacebookAuthTokenSerializer(CreateProfileMixin, serializers.Serializer):
    fb_access_token = serializers.CharField(required=True)
    fb_user_id = serializers.CharField(required=True)
    role = serializers.ChoiceField(required=True, write_only=True, choices=USER_ROLE)

    def to_internal_value(self, data):
        return {
            'fb_access_token': data['fbAccessToken'],
            'fb_user_id': data['fbUserID'],
            'role': data['role']
        }

    def validate_role(self, role: UserRole) -> UserRole:
        if role not in ROLES_WITH_ALLOWED_LOGIN:
            raise ValidationError('Incorrect user role')
        return role

    def save(self, **kwargs) -> User:
        fb_user_id: FBUserID = self.validated_data['fb_user_id']
        fb_access_token: FBAccessToken = self.validated_data['fb_access_token']
        role: UserRole = self.validated_data['role']
        with transaction.atomic():
            user, created = get_or_create_facebook_user(
                fb_access_token, fb_user_id, role
            )
            if created:
                self.create_profile_for_user(user=user)
            return user
