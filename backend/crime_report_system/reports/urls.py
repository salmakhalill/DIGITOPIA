from django.urls import path
from .views import (
    ReportCreateNestedView,  # الفورم الموحد
    ReportListView,
    ReportDetailView,
    ReportUpdateView,
    ReportDeleteView,
    ReportTrackView,
)

urlpatterns = [
    # إنشاء بلاغ جديد + بيانات المجرمين + المرفقات دفعة واحدة
    path('reports/new/', ReportCreateNestedView.as_view(), name='report-create-nested'),

    # عرض كل البلاغات
    path('reports/', ReportListView.as_view(), name='report-list'),

    # عرض بلاغ واحد بالتفصيل
    path('reports/<int:id>/', ReportDetailView.as_view(), name='report-detail'),

    # تعديل بلاغ
    path('reports/<int:id>/update/', ReportUpdateView.as_view(), name='report-update'),

    # حذف بلاغ
    path('reports/<int:id>/delete/', ReportDeleteView.as_view(), name='report-delete'),

    # تتبع بلاغ باستخدام tracking_code
    path('reports/track/<str:tracking_code>/', ReportTrackView.as_view(), name='report-track'),
]
