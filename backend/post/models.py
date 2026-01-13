from django.db import models
import hashlib
import time
from django.conf import settings
from .managers import PostManager

User: str = settings.AUTH_USER_MODEL


def profile_path(instance, filename: str) -> str:
    """
    Return a unique path for all user images
    """
    extension = filename.split(".").pop()
    directory_name = f"{instance.creator.username}_{instance.creator.id}"
    hash = hashlib.md5(str(time.time()).encode()).hexdigest()
    return f"images/posts/images/{directory_name}/{hash}.{extension}"


def route_file_path(instance, filename: str) -> str:
    """
    Return a unique path for route files
    """
    extension = filename.split(".").pop()
    directory_name = f"{instance.pilot.username}_{instance.pilot.id}"
    hash = hashlib.md5(str(time.time()).encode()).hexdigest()
    return f"routes/{directory_name}/{hash}.{extension}"


class Comment(models.Model):
    creator = models.ForeignKey(
        User, related_name="comments", on_delete=models.CASCADE)
    content = models.TextField()
    post = models.ForeignKey(
        "Post", related_name='comments', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.creator.username} at {self.created}'


class Post(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to=profile_path, default="", null=True, blank=True)
    creator = models.ForeignKey(
        User, related_name='posts', on_delete=models.CASCADE)
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name="liked_post", blank=True)
    saves = models.ManyToManyField(User, related_name="saved_post", blank=True)
    isEdited = models.BooleanField(default=False)
    objects = PostManager()

    def __str__(self):
        return f'{self.creator.username} at {self.created}'


class FlightRoute(models.Model):
    """Модель для маршрутов полетов"""
    pilot = models.ForeignKey(
        User, related_name='flight_routes', on_delete=models.CASCADE, verbose_name='Пилот')
    title = models.CharField(max_length=200, verbose_name='Название маршрута')
    departure = models.CharField(max_length=100, verbose_name='Точка отправления')
    destination = models.CharField(max_length=100, verbose_name='Точка назначения')
    
    # Координаты для интерактивной карты
    departure_lat = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        blank=True, 
        null=True,
        verbose_name='Широта отправления'
    )
    departure_lng = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        blank=True, 
        null=True,
        verbose_name='Долгота отправления'
    )
    destination_lat = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        blank=True, 
        null=True,
        verbose_name='Широта назначения'
    )
    destination_lng = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        blank=True, 
        null=True,
        verbose_name='Долгота назначения'
    )
    
    description = models.TextField(blank=True, null=True, verbose_name='Описание')
    flight_date = models.DateField(blank=True, null=True, verbose_name='Дата полета')
    flight_duration = models.DurationField(blank=True, null=True, verbose_name='Длительность полета')
    distance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Расстояние (км)'
    )
    aircraft_type = models.CharField(max_length=100, blank=True, null=True, verbose_name='Тип самолета')
    route_file = models.FileField(
        upload_to=route_file_path, 
        blank=True, 
        null=True,
        verbose_name='Файл маршрута'
    )
    is_public = models.BooleanField(default=True, verbose_name='Публичный маршрут')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name="liked_routes", blank=True)
    saves = models.ManyToManyField(User, related_name="saved_routes", blank=True)

    class Meta:
        ordering = ['-created']
        verbose_name = 'Маршрут полета'
        verbose_name_plural = 'Маршруты полетов'

    def __str__(self):
        return f'{self.departure} → {self.destination} by {self.pilot.username}'
