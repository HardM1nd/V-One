"""
Права доступа: пользователи с is_read_only (демо) могут читать и делать
лайки/подписки/сохранение, но не могут публиковать посты, комментарии, маршруты
и менять профиль.
"""
from rest_framework import permissions


class IsAuthenticatedReadOnlyForDemo(permissions.BasePermission):
    """
    Требует аутентификации. Для пользователей с is_read_only=True
    разрешены: GET/HEAD/OPTIONS и экшены с allow_read_only_user=True
    (лайки, подписки, сохранение). Публикация постов/маршрутов/комментариев
    и редактирование профиля запрещены.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not getattr(request.user, 'is_read_only', False):
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if getattr(view, 'allow_read_only_user', False):
            return True
        return False
