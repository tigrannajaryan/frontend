from uuid import uuid4

from django.db import models
from django.utils.translation import gettext_lazy as _


class ClientOfStylist(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)
    stylist = models.ForeignKey(
        'salon.Stylist', related_name='clients_of_stylist', on_delete=models.PROTECT)
    first_name = models.CharField(_('first name'), max_length=30, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True, default=None)

    class Meta:
        db_table = 'client_of_stylist'
        unique_together = (("stylist", "phone"), ("stylist", "first_name", "last_name"))

    def get_full_name(self):
        full_name = '{0} {1}'.format(self.first_name, self.last_name)
        return full_name.strip()

    def __str__(self):
        return self.get_full_name()
