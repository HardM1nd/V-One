from django.db import models
from django.contrib.auth.models import AbstractUser
import hashlib
import time
from django.utils.translation import gettext as _


def profile_path(user, filename: str) -> str:
    """
    Return a unique path for all user images
    """
    extension = filename.split(".").pop()
    directory_name = f"{user.username}_{user.id}"
    hash = hashlib.md5(str(time.time()).encode()).hexdigest()
    return f"images/profile/{directory_name}/{hash}.{extension}"


def cover_image_path(user, filename: str):
    extension = filename.split(".").pop()
    directory_name = f"{user.username}_{user.id}"
    hash = hashlib.md5(str(time.time()).encode()).hexdigest()
    return f"images/profile/cover/{directory_name}/{hash}.{extension}"


class User(AbstractUser):
    PILOT_TYPE_CHOICES = [
        ('virtual', 'Виртуальный пилот'),
        ('real', 'Реальный пилот'),
        ('both', 'Виртуальный и реальный'),
    ]
    
    profile_pic = models.ImageField(
        upload_to=profile_path, null=True, blank=True)
    following = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        blank=True,
        related_name='user_followers'
    )
    cover_pic = models.ImageField(
        upload_to=cover_image_path, null=True, blank=True, default="images/cover/coverphoto.jpg")
    followers = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        blank=True,
        related_name='user_following'
    )
    
    # Поля для пилотов
    pilot_type = models.CharField(
        max_length=10, 
        choices=PILOT_TYPE_CHOICES, 
        default='virtual',
        verbose_name='Тип пилота'
    )
    flight_hours = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.0,
        verbose_name='Часы налета'
    )
    aircraft_types = models.TextField(
        blank=True, 
        null=True,
        help_text='Типы самолетов через запятую (например: Cessna 172, Boeing 737)',
        verbose_name='Типы самолетов'
    )
    license_number = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        verbose_name='Номер лицензии'
    )
    bio = models.TextField(
        blank=True, 
        null=True,
        max_length=500,
        verbose_name='Биография'
    )
    is_read_only = models.BooleanField(
        default=False,
        verbose_name='Только чтение (демо)',
        help_text='Запрет постов, комментариев, редактирования профиля и т.п.',
    )

    def media_posts(self):
        """Возвращает посты пользователя с изображениями"""
        from django.db.models import Q
        # Фильтруем посты, у которых есть изображение (не null и не пустая строка)
        # Используем exclude для исключения пустых значений
        queryset = self.posts.exclude(
            Q(image__isnull=True) | Q(image='')
        )
        return queryset
    
    def get_aircraft_types_list(self):
        """Возвращает список типов самолетов"""
        if self.aircraft_types:
            return [t.strip() for t in self.aircraft_types.split(',') if t.strip()]
        return []


class Notification(models.Model):
    """Уведомления для пользователей."""

    NOTIFICATION_TYPES = [
        ("follow", "Новый подписчик"),
        ("like", "Лайк"),
        ("comment", "Комментарий"),
        ("system", "Системное уведомление"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        verbose_name=_("Получатель"),
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications_sent",
        null=True,
        blank=True,
        verbose_name=_("Инициатор"),
    )
    type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default="system",
        verbose_name=_("Тип уведомления"),
    )
    message = models.TextField(verbose_name=_("Сообщение"))
    is_read = models.BooleanField(default=False, verbose_name=_("Прочитано"))
    created = models.DateTimeField(auto_now_add=True, verbose_name=_("Создано"))

    # Универсальная ссылка на объект (пост, пользователь и т.п.)
    target_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name=_("Тип объекта"),
    )
    target_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("ID объекта"),
    )

    class Meta:
        ordering = ["-created"]
        verbose_name = _("Уведомление")
        verbose_name_plural = _("Уведомления")

    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"