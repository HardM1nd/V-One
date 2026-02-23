from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.serializers import UserSerializer
from accounts.models import Notification
from post.models import Comment, Post

from .models import Complaint, NavigationItem, SiteSettings, UserActionLog
from .serializers import (
    AdminMeSerializer,
    ComplaintSerializer,
    ComplaintUpdateSerializer,
    NavigationItemSerializer,
    SiteSettingsSerializer,
    UserActionLogSerializer,
)


User = get_user_model()


DEFAULT_PUBLIC_NAV_ITEMS = [
    {"key": "home", "label": "Главная", "order": 0},
    {"key": "explore", "label": "Обзор", "order": 1},
    {"key": "pilots", "label": "Пилоты", "order": 2},
    {"key": "routes", "label": "Маршруты", "order": 3},
    {"key": "notifications", "label": "Уведомления", "order": 4},
    {"key": "likes", "label": "Лайки", "order": 5},
    {"key": "saved", "label": "Сохраненные", "order": 6},
    {"key": "profile", "label": "Профиль", "order": 7},
]


def ensure_default_navigation() -> None:
    """Гарантирует наличие базовых пунктов навигации для публичного sidebar."""
    for item in DEFAULT_PUBLIC_NAV_ITEMS:
        NavigationItem.objects.get_or_create(
            key=item["key"],
            location=NavigationItem.LOCATION_PUBLIC_SIDEBAR,
            defaults={
                "label": item["label"],
                "order": item["order"],
                "is_visible_for_users": True,
                "is_enabled": True,
            },
        )


class IsAdmin(permissions.BasePermission):
    """Разрешение только для администраторов (is_staff)."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class AdminMeAPIView(generics.RetrieveAPIView):
    """Возвращает профиль текущего администратора."""

    serializer_class = AdminMeSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        return self.request.user


class AdminDashboardMetricsAPIView(APIView):
    """Метрики для дашборда админ‑панели."""

    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        day_ago = now - timedelta(days=1)

        total_users = User.objects.count()
        active_last_day = User.objects.filter(last_login__gte=day_ago).count()
        new_complaints = Complaint.objects.filter(created__gte=day_ago).count()
        actions_last_day = UserActionLog.objects.filter(created__gte=day_ago).count()

        data = {
            "total_users": total_users,
            "active_last_day": active_last_day,
            "new_complaints": new_complaints,
            "actions_last_day": actions_last_day,
        }
        return Response(data)


class AdminDashboardActivityChartAPIView(APIView):
    """Простые данные для графика активности пользователей."""

    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        days = 7
        start = now - timedelta(days=days - 1)

        qs = (
            UserActionLog.objects.filter(created__date__gte=start.date())
            .extra(select={"day": "date(created)"})
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        # Преобразуем к формату [{date: 'YYYY-MM-DD', count: N}, ...]
        results = [
            {"date": row["day"].isoformat() if hasattr(row["day"], "isoformat") else row["day"], "count": row["count"]}
            for row in qs
        ]
        return Response(results)


class ComplaintListAPIView(generics.ListAPIView):
    """Список жалоб пользователей с возможностью фильтрации."""

    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Complaint.objects.select_related("user", "handled_by")
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class ComplaintDetailAPIView(generics.RetrieveUpdateAPIView):
    """Детальная информация о жалобе и изменение её статуса."""

    queryset = Complaint.objects.select_related("user", "handled_by")
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            return ComplaintUpdateSerializer
        return ComplaintSerializer

    def perform_update(self, serializer):
        instance = serializer.save(handled_by=self.request.user)
        # Пример: можно создать системное уведомление пользователю о том, что жалоба обработана.
        Notification.objects.create(
            user=instance.user,
            actor=self.request.user,
            type="system",
            message="Ваша жалоба была обновлена администратором.",
        )


class UserActionLogListAPIView(generics.ListAPIView):
    """Лента действий пользователей с фильтрами."""

    serializer_class = UserActionLogSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = UserActionLog.objects.select_related("user")
        user_id = self.request.query_params.get("user_id")
        action = self.request.query_params.get("action")
        if user_id:
            qs = qs.filter(user_id=user_id)
        if action:
            qs = qs.filter(action__icontains=action)
        return qs


class NavigationConfigAPIView(APIView):
    """Получение и обновление конфигурации навигации (sidebar и пр.)."""

    permission_classes = [IsAdmin]

    def get(self, request):
        ensure_default_navigation()
        items = NavigationItem.objects.all()
        serializer = NavigationItemSerializer(items, many=True)
        return Response(serializer.data)

    def put(self, request):
        data = request.data

        # Клиент может прислать:
        # - список элементов [{...}, {...}]
        # - словарь c числовыми ключами {"0": {...}, "1": {...}}
        if isinstance(data, dict):
            # Если есть ключ "items" — используем его, иначе берём values()
            if "items" in data and isinstance(data["items"], list):
                data = data["items"]
            else:
                data = list(data.values())

        serializer = NavigationItemSerializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)

        NavigationItem.objects.all().delete()
        NavigationItem.objects.bulk_create(
            [NavigationItem(**item_data) for item_data in serializer.validated_data]
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class PublicNavigationAPIView(APIView):
    """Публичный endpoint с конфигурацией навигации для обычных пользователей."""

    permission_classes = [AllowAny]

    def get(self, request):
        ensure_default_navigation()
        items = (
            NavigationItem.objects.filter(
                location=NavigationItem.LOCATION_PUBLIC_SIDEBAR,
                is_visible_for_users=True,
                is_enabled=True,
            )
            .order_by("order", "id")
        )
        serializer = NavigationItemSerializer(items, many=True)
        return Response(serializer.data)


class SiteSettingsAPIView(APIView):
    """Чтение и обновление глобальных настроек сайта."""

    permission_classes = [IsAdmin]

    def get(self, request):
        settings_obj = SiteSettings.get_solo()
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        settings_obj = SiteSettings.get_solo()
        serializer = SiteSettingsSerializer(settings_obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminListCreateAPIView(generics.ListCreateAPIView):
    """Список администраторов и добавление нового администратора."""

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(is_staff=True)

    def create(self, request, *args, **kwargs):
        """
        Делает существующего пользователя администратором.

        Ожидает в теле запроса:
        - user_id: ID пользователя, которому нужно выдать права администратора.
        """
        from django.shortcuts import get_object_or_404

        user_id = request.data.get("user_id")
        if not user_id:
            return Response(
                {"detail": "Поле 'user_id' обязательно."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = get_object_or_404(User, pk=user_id)
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=["is_staff"])
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Изменение прав администратора или снятие прав."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):
        user = serializer.save()
        # Гарантируем, что в этом API пользователь остаётся админом
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=["is_staff"])

    def perform_destroy(self, instance):
        instance.is_staff = False
        instance.save(update_fields=["is_staff"])

