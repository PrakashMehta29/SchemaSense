from django.db import models

class UploadedDataset(models.Model):
    file = models.FileField(upload_to="uploads/")
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.filename} ({self.row_count}x{self.column_count}) at {self.uploaded_at}"
