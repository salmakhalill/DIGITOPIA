import uuid
from django.db import models

# جدول البلاغ الرئيسي
class Report(models.Model):

    location = models.CharField(max_length=255)
    # location_link = models.URLField(max_length=500, blank=True, null=True)  # لينك جوجل مابس
    latitude = models.DecimalField(max_digits=18, decimal_places=15, null=True, blank=True)
    longitude = models.DecimalField(max_digits=18, decimal_places=15, null=True, blank=True)
    incident_date = models.DateField()
    report_details = models.TextField()
    contact_info = models.CharField(max_length=255, blank=True, null=True)  
    report_type = models.CharField(
        max_length=20,
        choices=[
            ('اعتداء', 'اعتداء'),
            ('ابتزاز', 'ابتزاز'),
            ('تحرش', 'تحرش'),
            ('سرقة', 'سرقة'),
            ('مشادة', 'مشادة'),
        ],
        default='اعتداء'
    )
    case_status = models.CharField(
        max_length=20,
        choices=[
            ('received', 'تم استلام البلاغ'),
            ('under_review', 'قيد المراجعة'),
            ('in_progress', 'قيد المعالجة'),
            ('resolved', 'تم الحل'),
            ('closed', 'تم الإغلاق'),
    ],
    default='received'
    )
    tracking_code = models.CharField(max_length=12, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            self.tracking_code = uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tracking_code} - {self.case_status}"


# جدول معلومات المجرمين المرتبط بالبلاغ
class CriminalInfo(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="criminal_infos")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # أوصاف المجرم
    other_info = models.TextField(blank=True, null=True)   # معلومات إضافية

    def __str__(self):
        return self.name


# جدول المرفقات المرتبط بالبلاغ
class Attachment(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="attachments")
    audio_recording = models.FileField(upload_to="attachments/audio/", blank=True, null=True)  # الملفات الصوتية في مجلد منفصل
    file = models.FileField(upload_to="attachments/files/", blank=True, null=True)  # باقي الملفات في مجلد منفصل
    def __str__(self):
        return f"Attachment for {self.report.tracking_code}"
