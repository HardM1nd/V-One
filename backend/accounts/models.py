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

    def media_posts(self):
        return self.posts.exclude(image='')
    
    def get_aircraft_types_list(self):
        """Возвращает список типов самолетов"""
        if self.aircraft_types:
            return [t.strip() for t in self.aircraft_types.split(',') if t.strip()]
        return []