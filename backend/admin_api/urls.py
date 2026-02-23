from django.urls import path

from .views import (
    AdminDashboardActivityChartAPIView,
    AdminDashboardMetricsAPIView,
    AdminListCreateAPIView,
    AdminMeAPIView,
    AdminUpdateDestroyAPIView,
    ComplaintDetailAPIView,
    ComplaintListAPIView,
    NavigationConfigAPIView,
    PublicNavigationAPIView,
    SiteSettingsAPIView,
    UserActionLogListAPIView,
)


app_name = "admin_api"

urlpatterns = [
    path("me/", AdminMeAPIView.as_view(), name="me"),
    path("dashboard/metrics/", AdminDashboardMetricsAPIView.as_view(), name="dashboard-metrics"),
    path(
        "dashboard/activity-chart/",
        AdminDashboardActivityChartAPIView.as_view(),
        name="dashboard-activity-chart",
    ),
    path("complaints/", ComplaintListAPIView.as_view(), name="complaints-list"),
    path("complaints/<int:pk>/", ComplaintDetailAPIView.as_view(), name="complaints-detail"),
    path("activity/", UserActionLogListAPIView.as_view(), name="activity-list"),
    path("navigation/", NavigationConfigAPIView.as_view(), name="navigation"),
    path("navigation/public/", PublicNavigationAPIView.as_view(), name="navigation-public"),
    path("site-settings/", SiteSettingsAPIView.as_view(), name="site-settings"),
    path("admins/", AdminListCreateAPIView.as_view(), name="admins-list-create"),
    path("admins/<int:pk>/", AdminUpdateDestroyAPIView.as_view(), name="admins-detail"),
]

