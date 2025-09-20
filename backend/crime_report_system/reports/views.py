import json
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Report, CriminalInfo, Attachment
from .serializers import ReportNestedSerializer,  ReportTrackingSerializer

class ReportCreateNestedView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportNestedSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # تحويل criminal_infos من JSON string إلى قائمة
        criminal_infos = []
        if "criminal_infos" in data:
            try:
                criminal_infos = json.loads(data["criminal_infos"])
            except Exception:
                criminal_infos = []

        # إزالة criminal_infos من البيانات للـ serializer
        data.pop("criminal_infos", None)

        # تحويل latitude و longitude لأي float
        for field in ["latitude", "longitude"]:
            value = data.get(field)
            if isinstance(value, list):
                value = value[0]
            try:
                data[field] = float(value)
            except (TypeError, ValueError):
                data[field] = None

        # حفظ البلاغ الرئيسي
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        # حفظ المجرمين دفعة واحدة
        criminal_objs = [
            CriminalInfo(report=report, **criminal) for criminal in criminal_infos
        ]
        CriminalInfo.objects.bulk_create(criminal_objs)

        # حفظ المرفقات
        files = request.FILES.getlist("attachments")
        attachments_to_create = []
        for f in files:
            filename = f.name.lower()
            if "audio" in filename or filename.endswith((".mp3", ".wav", ".webm", ".ogg")):
                attachments_to_create.append(Attachment(report=report, audio_recording=f))
            else:
                attachments_to_create.append(Attachment(report=report, file=f))
        Attachment.objects.bulk_create(attachments_to_create)

        # إعادة البلاغ كامل مع المجرمين والمرفقات
        report_data = ReportNestedSerializer(report, context={"request": request}).data
        return Response(report_data, status=status.HTTP_201_CREATED)

# عرض كل البلاغات (يمكن إضافة nested إذا حابة تعرض المجرمين والمرفقات)
class ReportListView(generics.ListAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportNestedSerializer

# عرض بلاغ واحد بالتفصيل
class ReportDetailView(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportNestedSerializer
    lookup_field = "id"

# تعديل بلاغ (يمكن تعديل بيانات البلاغ فقط أو إضافة دعم للمجرمين والمرفقات لاحقًا)
class ReportUpdateView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportNestedSerializer
    lookup_field = "id"

# حذف بلاغ
class ReportDeleteView(generics.DestroyAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportNestedSerializer
    lookup_field = "id"

# تتبع بلاغ باستخدام tracking_code
class ReportTrackView(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportTrackingSerializer
    lookup_field = "tracking_code"
