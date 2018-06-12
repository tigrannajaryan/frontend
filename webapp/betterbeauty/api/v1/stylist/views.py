import datetime
from decimal import Decimal
from typing import Optional

from annoying.functions import get_object_or_None
from dateutil.parser import parse

from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from api.common.permissions import (
    StylistPermission,
    StylistRegisterUpdatePermission,
)
from appointment.models import Appointment
from appointment.types import AppointmentStatus
from client.models import Client
from core.utils import calculate_card_fee, calculate_tax, post_or_get
from salon.models import ServiceTemplateSet, Stylist, StylistService
from .constants import MAX_APPOINTMENTS_PER_REQUEST
from .serializers import (
    AppointmentPreviewRequestSerializer,
    AppointmentPreviewResponseSerializer,
    AppointmentSerializer,
    AppointmentUpdateSerializer,
    InvitationSerializer,
    ServiceTemplateSetDetailsSerializer,
    ServiceTemplateSetListSerializer,
    StylistAvailableWeekDayListSerializer,
    StylistAvailableWeekDaySerializer,
    StylistDiscountsSerializer,
    StylistSerializer,
    StylistServiceListSerializer,
    StylistServiceSerializer,
    StylistSettingsRetrieveSerializer,
    StylistTodaySerializer,
)
from .types import AppointmentPreviewRequest, AppointmentPreviewResponse


class StylistView(
    generics.CreateAPIView, generics.RetrieveUpdateAPIView
):
    serializer_class = StylistSerializer
    permission_classes = [StylistRegisterUpdatePermission, permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_None(
            Stylist,
            user=self.request.user
        )

    def get_serializer_context(self):
        return {
            'user': self.request.user
        }


class ServiceTemplateSetListView(views.APIView):
    serializer_class = ServiceTemplateSetListSerializer
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                'service_template_sets': self.serializer_class(self.get_queryset(), many=True).data
            }
        )

    def get_queryset(self):
        return ServiceTemplateSet.objects.all()


class ServiceTemplateSetDetailsView(generics.RetrieveAPIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    serializer_class = ServiceTemplateSetDetailsSerializer
    lookup_field = 'uuid'
    lookup_url_kwarg = 'template_set_uuid'

    def get_queryset(self):
        return ServiceTemplateSet.objects.all()

    def get_serializer_context(self):
        return {'stylist': self.request.user.stylist}


class StylistServiceListView(generics.RetrieveUpdateAPIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    serializer_class = StylistServiceListSerializer

    def post(self, request, *args, **kwargs):
        """Use this merely to allow using POST as PATCH"""
        return self.partial_update(request, *args, **kwargs)

    def get_object(self):
        return self.request.user.stylist

    def get_queryset(self):
        return self.request.user.stylist.services.all()


class StylistServiceView(generics.DestroyAPIView):
    serializer_class = StylistServiceSerializer
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    lookup_url_kwarg = 'uuid'
    lookup_field = 'uuid'

    def delete(self, request, *args, **kwargs):
        service: StylistService = self.get_object()
        service.deleted_at = service.stylist.get_current_now()
        service.save(update_fields=['deleted_at', ])
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_queryset(self):
        return self.request.user.stylist.services.all()


class StylistAvailabilityView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    def get(self, request):
        return Response(StylistAvailableWeekDayListSerializer(self.get_object()).data)

    def patch(self, request):
        return self.post(request)

    def post(self, request):
        serializer = StylistAvailableWeekDaySerializer(
            data=request.data, many=True,
            context={'user': self.request.user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(stylist=self.get_object())
        return Response(
            StylistAvailableWeekDayListSerializer(self.get_object()).data
        )

    def get_object(self):
        return getattr(self.request.user, 'stylist', None)


class StylistDiscountsView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    serializer_class = StylistDiscountsSerializer

    def get(self, request):
        return Response(StylistDiscountsSerializer(self.get_object()).data)

    def post(self, request):
        serializer = StylistDiscountsSerializer(
            instance=self.request.user.stylist,
            data=request.data,
            context={'user': self.request.user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StylistDiscountsSerializer(self.get_object()).data)

    def get_object(self):
        return getattr(self.request.user, 'stylist', None)


class StylistTodayView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    def get(self, request):
        return Response(StylistTodaySerializer(self.get_object()).data)

    def get_object(self):
        return getattr(self.request.user, 'stylist', None)


class StylistAppointmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_serializer_context(self):
        return {
            'stylist': self.request.user.stylist,
            'force_start': post_or_get(self.request, 'force_start', False) == 'true'
        }

    def get_queryset(self):
        stylist = self.request.user.stylist

        date_from_str = post_or_get(self.request, 'date_from')
        date_to_str = post_or_get(self.request, 'date_to')

        include_cancelled = post_or_get(self.request, 'include_cancelled', False) == 'true'
        limit = int(post_or_get(self.request, 'limit', MAX_APPOINTMENTS_PER_REQUEST))

        datetime_from = None
        datetime_to = None

        if date_from_str:
            datetime_from = parse(date_from_str).replace(
                hour=0, minute=0, second=0
            )
        if date_to_str:
            datetime_to = (parse(date_to_str) + datetime.timedelta(days=1)).replace(
                hour=0, minute=0, second=0
            )

        return stylist.get_appointments_in_datetime_range(
            datetime_from, datetime_to, include_cancelled
        )[:limit]


class StylistAppointmentPreviewView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    def post(self, request):
        stylist: Stylist = self.request.user.stylist
        serializer = AppointmentPreviewRequestSerializer(
            data=request.data, context={'stylist': stylist, 'force_start': True}
        )
        serializer.is_valid(raise_exception=True)
        preview_request = AppointmentPreviewRequest(**serializer.validated_data)
        response_serializer = AppointmentPreviewResponseSerializer(
            self._get_response_dict(
                stylist, preview_request
            ))
        return Response(response_serializer.data)

    @staticmethod
    def _get_response_dict(
            stylist: Stylist,
            preview_request: AppointmentPreviewRequest
    ) -> AppointmentPreviewResponse:
        # need to use comprehension to accommodate possible duplicated
        # services, which is actually a valid case (e.g. double conditioning)
        services = [
            stylist.services.get(service_uuid=service['service_uuid'])
            for service in preview_request.services
        ]
        client: Optional[Client] = Client.objects.filter(
            uuid=preview_request.client_uuid
        ) if preview_request.client_uuid else None

        total_client_price_before_tax = Decimal(sum(
            [
                service.calculate_price_for_client(
                    datetime_start_at=preview_request.datetime_start_at,
                    client=client
                ) for service in services
            ], Decimal(0))
        )

        total_tax = calculate_tax(total_client_price_before_tax)
        total_card_fee = calculate_card_fee(total_client_price_before_tax + total_tax)

        duration = sum(
            [service.duration for service in services], datetime.timedelta(0)
        )

        # TODO: rework along with time gap check implementation
        conflicts_with = stylist.get_appointments_in_datetime_range(
            preview_request.datetime_start_at,
            preview_request.datetime_start_at + duration
        )

        return AppointmentPreviewResponse(
            total_client_price_before_tax=total_client_price_before_tax,
            total_tax=total_tax,
            total_card_fee=total_card_fee,
            duration=duration,
            conflicts_with=conflicts_with
        )


class StylistAppointmentRetrieveUpdateCancelView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    lookup_url_kwarg = 'appointment_uuid'
    lookup_field = 'uuid'

    def post(self, request, *args, **kwargs):
        """Use this merely to allow using POST as PATCH"""
        return self.partial_update(request, *args, **kwargs)

    def perform_destroy(self, instance: Appointment):
        instance.set_status(AppointmentStatus.CANCELLED_BY_STYLIST, self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AppointmentSerializer
        return AppointmentUpdateSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(AppointmentSerializer(appointment).data)

    def get_serializer_context(self):
        return {
            'user': self.request.user,
            'stylist': self.request.user.stylist
        }

    def get_queryset(self):
        stylist = self.request.user.stylist
        return Appointment.all_objects.filter(
            stylist=stylist
        ).order_by('datetime_start_at')


class InvitationView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    def post(self, request):
        serializer = InvitationSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        created_objects = serializer.save(stylist=self.request.user.stylist)
        response_status = status.HTTP_200_OK
        if len(created_objects) > 0:
            response_status = status.HTTP_201_CREATED
        return Response(
            InvitationSerializer(created_objects, many=True).data,
            status=response_status
        )


class StylistSettingsRetrieveView(generics.RetrieveAPIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    serializer_class = StylistSettingsRetrieveSerializer

    def get_object(self):
        return self.request.user.stylist
