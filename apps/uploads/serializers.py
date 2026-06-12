from rest_framework import serializers
from apps.uploads.models import UploadedDataset
from apps.uploads.validators import validate_file_extension, validate_file_size

class UploadedDatasetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(validators=[validate_file_extension, validate_file_size])

    class Meta:
        model = UploadedDataset
        fields = ["id", "file", "filename", "row_count", "column_count", "uploaded_at"]
        read_only_fields = ["filename", "row_count", "column_count", "uploaded_at"]
