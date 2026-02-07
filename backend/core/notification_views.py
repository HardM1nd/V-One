from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsAuthenticatedReadOnlyForDemo
from rest_framework.response import Response

from accounts.models import Notification


@api_view(["GET"])
@permission_classes([IsAuthenticatedReadOnlyForDemo])
def unread_notifications_count(request):
    """
    Возвращает количество непрочитанных уведомлений.
    """
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"unread_count": count})
