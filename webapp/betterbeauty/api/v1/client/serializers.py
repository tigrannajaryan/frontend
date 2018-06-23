from rest_framework import serializers

from client.models import ClientOfStylist


class ClientSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone = serializers.CharField(source='user.phone')

    class Meta:
        model = ClientOfStylist
        fields = ['first_name', 'last_name', 'phone', 'uuid', ]
