from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.uploads.models import UploadedDataset
import tempfile
import os

class UploadsTestCase(APITestCase):
    def setUp(self):
        # Setup temporary directories for files during tests
        self.temp_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.temp_dir.name)
        self.settings_override.enable()

    def tearDown(self):
        self.settings_override.disable()
        self.temp_dir.cleanup()

    def test_upload_valid_csv(self):
        csv_content = b"name,age,email\nAlice,30,alice@test.com\nBob,25,bob@test.com\n"
        csv_file = SimpleUploadedFile("test.csv", csv_content, content_type="text/csv")
        
        response = self.client.post(reverse("dataset-upload"), {"file": csv_file})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["filename"], "test.csv")
        self.assertEqual(response.data["data"]["rows"], 2)
        self.assertEqual(response.data["data"]["columns"], 3)

    def test_upload_invalid_extension(self):
        txt_content = b"some plain text content"
        txt_file = SimpleUploadedFile("test.txt", txt_content, content_type="text/plain")
        
        response = self.client.post(reverse("dataset-upload"), {"file": txt_file})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("Unsupported file format", response.data["message"])

    def test_upload_empty_file(self):
        csv_file = SimpleUploadedFile("empty.csv", b"", content_type="text/csv")
        
        response = self.client.post(reverse("dataset-upload"), {"file": csv_file})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("empty", response.data["message"])


class EndToEndApiTestCase(APITestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.temp_dir.name)
        self.settings_override.enable()
        
        # Setup employees dataset containing email, phone, Aadhaar, PAN, and salary columns
        self.csv_content = (
            b"name,age,email,phone,aadhaar,pan,salary\n"
            b"Alice,30,alice@test.com,9876543210,1234 5678 9012,ABCDE1234F,50000\n"
            b"Bob,25,bob@test.com,9123456789,9876 5432 1098,XYZWT9876K,60000\n"
        )
        self.csv_file = SimpleUploadedFile("employees.csv", self.csv_content, content_type="text/csv")
        
        # Create database record
        self.dataset = UploadedDataset.objects.create(
            file=self.csv_file,
            filename="employees.csv",
            row_count=2,
            column_count=7
        )

    def tearDown(self):
        self.settings_override.disable()
        self.temp_dir.cleanup()

    def test_profile_summary_endpoint(self):
        response = self.client.get(reverse("profile-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["rows"], 2)
        self.assertEqual(response.data["data"]["columns"], 7)
        self.assertIn("email", response.data["data"]["data_types"])

    def test_generate_metadata_endpoint(self):
        response = self.client.post(
            reverse("generate-metadata"),
            {"columns": ["name", "age", "email"]},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("metadata", response.data)
        self.assertEqual(len(response.data["metadata"]), 3)
        self.assertEqual(response.data["metadata"][0]["Column Name"], "name")

    def test_health_score_endpoint(self):
        response = self.client.get(reverse("health-score"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("score", response.data)
        self.assertIn("Completeness", response.data["dimensions"])

    def test_governance_report_endpoint(self):
        response = self.client.get(reverse("governance-report"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("risks", response.data)
        self.assertGreater(len(response.data["risks"]), 0)

    def test_chat_endpoint(self):
        response = self.client.post(
            reverse("ai-chat"),
            {"message": "explain the dataset"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("response", response.data)
