import datetime
from decimal import Decimal
from typing import List, Optional

from annoying.functions import get_object_or_None
from dateutil.parser import parse
from django.db import transaction

from django.db.models import F, Q, QuerySet, Value
from django.db.models.functions import Concat

from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from api.common.permissions import (
    StylistPermission,
    StylistRegisterUpdatePermission,
)
from appointment.models import Appointment, AppointmentService
from appointment.types import AppointmentStatus
from client.models import ClientOfStylist
from core.types import AppointmentPrices
from core.utils import (
    calculate_appointment_prices,
    post_or_get,
)
from salon.models import ServiceTemplateSet, Stylist, StylistService
from salon.utils import calculate_price_and_discount_for_client_on_date
from .constants import MAX_APPOINTMENTS_PER_REQUEST
from .serializers import (
    AppointmentPreviewRequestSerializer,
    AppointmentPreviewResponseSerializer,
    AppointmentSerializer,
    AppointmentUpdateSerializer,
    ClientSerializer,
    InvitationSerializer,
    ServiceTemplateSetDetailsSerializer,
    ServiceTemplateSetListSerializer,
    StylistAvailableWeekDayListSerializer,
    StylistAvailableWeekDaySerializer,
    StylistDiscountsSerializer,
    StylistSerializer,
    StylistServiceListSerializer,
    StylistServicePricingRequestSerializer,
    StylistServicePricingSerializer,
    StylistServiceSerializer,
    StylistSettingsRetrieveSerializer,
    StylistTodaySerializer,
)
from .types import (
    AppointmentPreviewRequest,
    AppointmentPreviewResponse,
    AppointmentServicePreview,
)


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
        client: Optional[ClientOfStylist] = ClientOfStylist.objects.filter(
            uuid=preview_request.client_uuid
        ) if preview_request.client_uuid else None

        service_items: List[AppointmentServicePreview] = []
        appointment: Optional[Appointment] = None
        if preview_request.appointment_uuid is not None:
            appointment = stylist.appointments.get(uuid=preview_request.appointment_uuid)

        for service_request_item in preview_request.services:
            appointment_service: Optional[AppointmentService] = None
            if appointment:
                appointment_service = appointment.services.filter(
                    service_uuid=service_request_item['service_uuid']
                ).last()
            client_price: Optional[Decimal] = service_request_item[
                'client_price'] if 'client_price' in service_request_item else None
            if appointment_service:
                if client_price:
                    appointment_service.set_client_price(client_price)
                # service already exists in appointment, and will not be recalculated,
                # so we should take it's data verbatim
                service_item = AppointmentServicePreview(
                    uuid=appointment_service.uuid,
                    service_uuid=appointment_service.service_uuid,
                    service_name=appointment_service.service_name,
                    regular_price=appointment_service.regular_price,
                    client_price=appointment_service.client_price,
                    duration=appointment_service.duration,
                    is_original=appointment_service.is_original
                )
            else:
                # appointment service doesn't exist in appointment yet, and is to be added, so we
                # need to calculate the price for it. If appointment itself doesn't exist yet -
                # we will calculate price with discounts. If appointment already exists -
                # this is an addition, so no discount will apply
                service: StylistService = stylist.services.get(
                    uuid=service_request_item['service_uuid']
                )
                if not client_price:
                    client_price = service.regular_price
                    if not appointment:
                        client_price = Decimal(calculate_price_and_discount_for_client_on_date(
                            service=service, client=client,
                            date=preview_request.datetime_start_at.date()
                        ).price)
                service_item = AppointmentServicePreview(
                    uuid=None,
                    service_uuid=service.uuid,
                    service_name=service.name,
                    regular_price=service.regular_price,
                    client_price=client_price,
                    duration=service.duration,
                    is_original=False
                )
            service_items.append(service_item)

        total_client_price_before_tax = sum([s.client_price for s in service_items], Decimal(0))
        appointment_prices: AppointmentPrices = calculate_appointment_prices(
            price_before_tax=total_client_price_before_tax,
            include_card_fee=preview_request.has_card_fee_included,
            include_tax=preview_request.has_tax_included
        )
        duration = sum(
            [s.duration for s in service_items], datetime.timedelta(0)
        )

        conflicts_with = stylist.get_appointments_in_datetime_range(
            preview_request.datetime_start_at,
            preview_request.datetime_start_at,
            including_to=True,
            include_cancelled=False,
        )
        return AppointmentPreviewResponse(
            duration=duration,
            conflicts_with=conflicts_with,
            total_client_price_before_tax=appointment_prices.total_client_price_before_tax,
            grand_total=appointment_prices.grand_total,
            total_tax=appointment_prices.total_tax,
            total_card_fee=appointment_prices.total_card_fee,
            has_tax_included=appointment_prices.has_tax_included,
            has_card_fee_included=appointment_prices.has_card_fee_included,
            services=service_items
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
        stylist = self.request.user.stylist
        with transaction.atomic():
            created_objects = serializer.save(stylist=stylist)
            stylist.has_invited_clients = True
            stylist.save(update_fields=['has_invited_clients'])
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


class ClientSearchView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]
    serializer_class = ClientSerializer

    def get(self, request, *args, **kwargs):
        return Response({'clients': ClientSerializer(
            self.get_queryset(), many=True
        ).data})

    @staticmethod
    def _search_clients(stylist: Stylist, query: str) -> QuerySet:
        if len(query) < 3:
            return ClientOfStylist.objects.none()

        # we will only search among current stylist's clients, i.e. those
        # who already had appointments with this stylist in the past

        # TODO: Also extend this to those clients who have accepted invitations
        # TODO: from the stylist (even though had no appointments yet)

        stylists_clients = ClientOfStylist.objects.filter(
            stylist=stylist,
        ).annotate(
            full_name=Concat(F('first_name'), Value(' '), F('last_name')),
            reverse_full_name=Concat(F('last_name'), Value(' '), F('first_name')),
        ).distinct('id')

        name_phone_query = (
            Q(full_name__icontains=query) |
            Q(phone__icontains=query) |
            Q(reverse_full_name__icontains=query)
        )

        return stylists_clients.filter(
            name_phone_query
        )

    def get_queryset(self):
        query: str = post_or_get(self.request, 'query', '').strip()
        stylist: Stylist = self.request.user.stylist
        return self._search_clients(
            stylist=stylist,
            query=query
        )


class StylistServicePricingView(views.APIView):
    permission_classes = [StylistPermission, permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = StylistServicePricingRequestSerializer(
            data=request.data, context={'stylist': request.user.stylist}
        )
        serializer.is_valid(raise_exception=True)
        client_uuid = serializer.validated_data.get('client_uuid', None)
        client = None
        if client_uuid:
            client = ClientOfStylist.objects.get(uuid=client_uuid)
        service_uuid = serializer.validated_data['service_uuid']

        service = self.get_queryset().filter(uuid=service_uuid).last()

        return Response(
            StylistServicePricingSerializer(service, context={'client': client}).data
        )

    def get_queryset(self):
        return self.request.user.stylist.services.all()
