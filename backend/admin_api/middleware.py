from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils.deprecation import MiddlewareMixin

from .models import SiteSettings, UserActionLog


class SiteClosedForPublicMiddleware(MiddlewareMixin):
    """
    Если сайт закрыт для обычных пользователей, не пускаем их на публичную часть.

    - Администраторы (is_staff) всегда имеют доступ.
    - Админ‑панель и её API (`/admin/`, `/api/admin/`) всегда доступны.
    - Для API возвращаем JSON с кодом 503.
    - Для остальных путей — простая текстовая заглушка 503.
    """

    def process_request(self, request: HttpRequest) -> HttpResponse | None:
        path = request.path or ""

        # Всегда пропускаем:
        # - /admin/        — Django admin и админ‑панель фронтенда
        # - /api/admin/    — все админские API (дальше проверяются DRF‑правами)
        # - /api/accounts/ — логин, refresh токена, профиль, уведомления
        if (
            path.startswith("/admin/")
            or path.startswith("/api/admin/")
            or path.startswith("/api/accounts/")
        ):
            return None

        # Получаем настройки сайта
        settings_obj = SiteSettings.get_solo()
        if not settings_obj.is_closed_for_public:
            return None

        user = getattr(request, "user", None)
        is_admin = bool(
            user is not None and user.is_authenticated and getattr(user, "is_staff", False)
        )

        # Админы видят весь сайт (включая API постов) даже в режиме обслуживания
        if is_admin:
            return None

        # Для обычных пользователей дополнительно разрешаем только API post,
        # если сайт не закрыт (сюда мы не попадём при is_closed_for_public == False),
        # поэтому при закрытом сайте /api/post/ для них будет недоступен.
        if path.startswith("/api/post/"):
            # Сайт закрыт и пользователь не администратор -> блокируем
            message = settings_obj.maintenance_message or "Сайт временно недоступен. Пожалуйста, попробуйте позже."
            return JsonResponse({"detail": message}, status=503)

        message = settings_obj.maintenance_message or "Сайт временно недоступен. Пожалуйста, попробуйте позже."

        if path.startswith("/api/"):
            return JsonResponse(
                {"detail": message},
                status=503,
            )

        return HttpResponse(message, status=503)


class UserActionLogMiddleware(MiddlewareMixin):
    """
    Логирует действия аутентифицированных пользователей.

    Для уменьшения шума записываем:
    - любые запросы (GET/POST/...) к /api/post/
    - мутационные запросы (POST/PUT/PATCH/DELETE) к /api/accounts/
    """

    def process_view(self, request: HttpRequest, view_func, view_args, view_kwargs):
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated):
            return None

        path = request.path or ""

        # Не логируем чисто админские запросы (для них есть отдельные инструменты)
        if path.startswith("/api/admin/"):
            return None

        method = request.method.upper()

        should_log = False
        if path.startswith("/api/post/"):
            should_log = True
        elif path.startswith("/api/accounts/") and method in {"POST", "PUT", "PATCH", "DELETE"}:
            should_log = True

        if not should_log:
            return None

        try:
            xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
            ip = (xff.split(",")[0].strip() if xff else "") or request.META.get("REMOTE_ADDR")

            UserActionLog.objects.create(
                user=user,
                action=f"{method} {path}",
                path=path,
                ip_address=ip or None,
                extra={},
            )
        except Exception:
            # Логирование не должно ломать основной запрос
            return None

        return None

