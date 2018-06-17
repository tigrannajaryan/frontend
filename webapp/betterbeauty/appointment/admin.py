from django import forms
from django.contrib import admin

from core.models import User

from .models import Appointment, AppointmentService


class AppointmentServiceAdminForm(forms.ModelForm):
    class Meta:
        model = AppointmentService
        fields = '__all__'

    def clean_service_uuid(self):
        service_uuid = self.cleaned_data.get('service_uuid')
        appointment = self.cleaned_data.get('appointment')
        if not appointment.stylist.services.filter(
                uuid=service_uuid
        ).exists():
            raise forms.ValidationError(
                "Appointment's service_uuid must match `uuid` "
                "of any of the stylist's services"
            )
        return service_uuid


class AppointmentAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(AppointmentAdminForm, self).__init__(*args, **kwargs)
        self.fields['client'].required = False

    def clean(self):
        cleaned_data = super(AppointmentAdminForm, self).clean()
        if not cleaned_data.get('client', None):
            if not (cleaned_data.get('client_first_name') or
                    cleaned_data.get('client_last_name')):
                raise forms.ValidationError(
                    {'client': 'Either a client object, or first '
                               'and last names must be supplied'
                     }
                )
        return cleaned_data

    class Meta:
        model = Appointment
        fields = '__all__'

    def save(self, commit=True):
        current_user: User = getattr(self, 'current_user')
        instance = super(AppointmentAdminForm, self).save(commit=False)
        if not instance.id:
            instance.created_by = current_user
        if commit:
            instance.save()
        return instance


class AppointmentAdmin(admin.ModelAdmin):
    readonly_fields = [
        'deleted_at', 'deleted_by', 'created_at', 'created_by',
    ]
    form = AppointmentAdminForm

    class Meta:
        model = Appointment

    def get_form(self, request, *args, **kwargs):
        form = super(AppointmentAdmin, self).get_form(request, *args, **kwargs)
        form.current_user = request.user
        return form


class AppointmentServiceAdmin(admin.ModelAdmin):
    form = AppointmentServiceAdminForm

    class Meta:
        model = AppointmentService


admin.site.register(Appointment, AppointmentAdmin)
admin.site.register(AppointmentService, AppointmentServiceAdmin)
