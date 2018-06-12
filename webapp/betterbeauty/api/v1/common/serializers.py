from django.conf import settings

from rest_framework import serializers

from core.models import TemporaryFile, User


class TemporaryImageSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(read_only=True)
    file = serializers.ImageField(write_only=True)

    class Meta:
        model = TemporaryFile
        fields = ['file', 'uuid', ]

    def validate_file(self, file):
        if file.size > settings.MAX_FILE_UPLOAD_SIZE:
            raise serializers.ValidationError('File is too big, max. size {0} bytes'.format(
                settings.MAX_FILE_UPLOAD_SIZE
            ))
        return file

    def save(self, **kwargs):
        uploaded_by: User = self.context['user']
        return super(TemporaryImageSerializer, self).save(
            uploaded_by=uploaded_by, **kwargs
        )
