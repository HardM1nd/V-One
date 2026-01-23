from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import (
    FollowUnfollowUserAPIView,
    MyTokenObtainPairView,
    UserDetailAPIView,
    SignupAPIView,
    ProfileUpdateAPIView,
    FollowingListAPIView,
    FollowerListAPIView,
    PilotListAPIView,
    NotificationListAPIView,
    NotificationReadAPIView,
    NotificationReadAllAPIView,
    NotificationUnreadCountAPIView,
)


urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("info/", UserDetailAPIView.as_view()),
    path("<int:id>/info/", UserDetailAPIView.as_view()),
    path("signup/", SignupAPIView.as_view()),
    path("<int:id>/following/", FollowingListAPIView.as_view()),
    path("<int:id>/followers/", FollowerListAPIView.as_view()),
    path("profile/update/", ProfileUpdateAPIView.as_view()),
    path("follow_unfollow/<int:pk>/", FollowUnfollowUserAPIView.as_view()),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path("pilots/", PilotListAPIView.as_view(), name='pilot_list'),
    path("notifications/", NotificationListAPIView.as_view(), name="notifications"),
    path(
        "notifications/<int:pk>/read/",
        NotificationReadAPIView.as_view(),
        name="notification_read",
    ),
    path(
        "notifications/read_all/",
        NotificationReadAllAPIView.as_view(),
        name="notification_read_all",
    ),
    path(
        "notifications/unread_count/",
        NotificationUnreadCountAPIView.as_view(),
        name="notification_unread_count",
    ),
]
