from django.conf import settings
from django.db import models


User = settings.AUTH_USER_MODEL


class Complaint(models.Model):
    """Жалобы пользователей, доступные только администраторам."""

    STATUS_NEW = "new"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_CLOSED = "closed"

    STATUS_CHOICES = [
        (STATUS_NEW, "Новая"),
        (STATUS_IN_PROGRESS, "В работе"),
        (STATUS_CLOSED, "Закрыта"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="complaints",
        verbose_name="Пользователь",
    )
    created = models.DateTimeField(auto_now_add=True, verbose_name="Создана")
    updated = models.DateTimeField(auto_now=True, verbose_name="Обновлена")
    category = models.CharField(max_length=100, blank=True, verbose_name="Категория")
    text = models.TextField(verbose_name="Текст жалобы")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
        verbose_name="Статус",
    )
    handled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="handled_complaints",
        verbose_name="Обработал",
    )
    internal_comment = models.TextField(
        blank=True,
        verbose_name="Внутренний комментарий администратора",
    )

    class Meta:
        ordering = ["-created"]
        verbose_name = "Жалоба"
        verbose_name_plural = "Жалобы"

    def __str__(self) -> str:
        return f"Complaint #{self.pk} from {self.user}"


class UserActionLog(models.Model):
    """Лог всех действий пользователей, просматривается в админ‑панели."""

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="action_logs",
        verbose_name="Пользователь",
    )
    action = models.CharField(max_length=150, verbose_name="Действие")
    path = models.CharField(max_length=255, blank=True, verbose_name="Путь/страница")
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="IP‑адрес",
    )
    extra = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Доп. данные",
    )
    created = models.DateTimeField(auto_now_add=True, verbose_name="Создано")

    class Meta:
        ordering = ["-created"]
        verbose_name = "Лог действия пользователя"
        verbose_name_plural = "Логи действий пользователей"

    def __str__(self) -> str:
        return f"{self.user} – {self.action} @ {self.created}"


class NavigationItem(models.Model):
    """Конфигурация пунктов меню (публичный sidebar, админ‑вкладки и т.п.)."""

    LOCATION_PUBLIC_SIDEBAR = "public_sidebar"
    LOCATION_ADMIN_SIDEBAR = "admin_sidebar"

    LOCATION_CHOICES = [
        (LOCATION_PUBLIC_SIDEBAR, "Публичный sidebar"),
        (LOCATION_ADMIN_SIDEBAR, "Админский sidebar"),
    ]

    key = models.SlugField(
        max_length=100,
        unique=True,
        verbose_name="Ключ (slug)",
        help_text="Системное имя пункта меню, например: home, explore, admin_dashboard",
    )
    label = models.CharField(max_length=100, verbose_name="Название пункта")
    location = models.CharField(
        max_length=50,
        choices=LOCATION_CHOICES,
        default=LOCATION_PUBLIC_SIDEBAR,
        verbose_name="Расположение",
    )
    is_visible_for_users = models.BooleanField(
        default=True,
        verbose_name="Виден обычным пользователям",
    )
    is_enabled = models.BooleanField(
        default=True,
        verbose_name="Раздел активен",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")

    class Meta:
        ordering = ["location", "order", "key"]
        verbose_name = "Элемент навигации"
        verbose_name_plural = "Элементы навигации"

    def __str__(self) -> str:
        return f"{self.location}: {self.label}"


class SiteSettings(models.Model):
    """Глобальные настройки сайта, в том числе закрытие для обычных пользователей."""

    is_closed_for_public = models.BooleanField(
        default=False,
        verbose_name="Сайт закрыт для обычных пользователей",
    )
    maintenance_message = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Сообщение режима обслуживания",
        help_text="Текст, который увидят обычные пользователи при закрытом сайте.",
    )
    updated = models.DateTimeField(auto_now=True, verbose_name="Обновлено")

    class Meta:
        verbose_name = "Настройки сайта"
        verbose_name_plural = "Настройки сайта"

    def __str__(self) -> str:
        return "Глобальные настройки сайта"

    @classmethod
    def get_solo(cls) -> "SiteSettings":
        """Всегда возвращает один инстанс настроек."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

