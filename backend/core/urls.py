"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .notification_views import unread_notifications_count


# Медиа прокси должен быть добавлен ПЕРЕД основными маршрутами
# для правильной обработки запросов к /media/
import os
use_s3 = os.getenv("USE_S3", "False").lower() == "true"

media_urlpatterns = []
if use_s3:
    # Если используется S3, добавляем прокси для медиа файлов
    from django.urls import re_path
    from django.http import HttpResponse, Http404
    from django.core.files.storage import default_storage
    import mimetypes
    import logging
    
    logger = logging.getLogger(__name__)
    
    def media_proxy(request, path):
        """Прокси для медиа файлов из MinIO через Django"""
        # Убираем ведущий слэш если есть
        file_path = path.lstrip('/')
        
        if not file_path:
            raise Http404("Media file path is empty")
        
        # Пытаемся получить файл напрямую из storage
        try:
            if default_storage.exists(file_path):
                try:
                    file = default_storage.open(file_path, 'rb')
                    content = file.read()
                    file.close()
                    
                    # Определяем content type
                    content_type, _ = mimetypes.guess_type(file_path)
                    if not content_type:
                        content_type = 'application/octet-stream'
                    
                    response = HttpResponse(content, content_type=content_type)
                    # Добавляем заголовки для кэширования и CORS
                    response['Cache-Control'] = 'public, max-age=3600'
                    response['Access-Control-Allow-Origin'] = '*'
                    response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
                    return response
                except Exception as e:
                    logger.warning(f"Failed to read file from storage: {e}")
        except Exception as e:
            logger.warning(f"Failed to check file existence in storage: {e}")
        
        # Если не удалось получить файл напрямую через storage, пробуем через boto3 client
        try:
            import boto3
            from botocore.client import Config
            from botocore.exceptions import ClientError
            
            # Получаем настройки MinIO
            endpoint_url = os.getenv('AWS_S3_ENDPOINT_URL', getattr(settings, 'AWS_S3_ENDPOINT_URL', 'http://minio:9000'))
            bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'media'))
            access_key = os.getenv('AWS_ACCESS_KEY_ID', getattr(settings, 'AWS_ACCESS_KEY_ID', 'minioadmin'))
            secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', getattr(settings, 'AWS_SECRET_ACCESS_KEY', 'minioadmin'))
            use_ssl = os.getenv('AWS_S3_USE_SSL', str(getattr(settings, 'AWS_S3_USE_SSL', False))).lower() == 'true'
            
            # Создаем boto3 client для MinIO
            s3_client = boto3.client(
                's3',
                endpoint_url=endpoint_url,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                config=Config(signature_version='s3v4'),
                use_ssl=use_ssl,
                verify=False
            )
            
            # Пытаемся получить объект из MinIO
            try:
                obj = s3_client.get_object(Bucket=bucket_name, Key=file_path)
                content = obj['Body'].read()
                
                # Определяем content type
                content_type = obj.get('ContentType', 'application/octet-stream')
                if not content_type or content_type == 'binary/octet-stream':
                    content_type, _ = mimetypes.guess_type(file_path)
                    if not content_type:
                        content_type = 'application/octet-stream'
                
                django_response = HttpResponse(content, content_type=content_type)
                django_response['Cache-Control'] = 'public, max-age=3600'
                django_response['Access-Control-Allow-Origin'] = '*'
                django_response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
                return django_response
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', '')
                if error_code == 'NoSuchKey':
                    logger.warning(f"File not found in MinIO: {file_path}")
                else:
                    logger.warning(f"Failed to get file from MinIO via boto3: {e}")
            except Exception as e:
                logger.warning(f"Failed to get file from MinIO via boto3: {e}")
        except Exception as e:
            logger.warning(f"Failed to create boto3 client: {e}")
        
        # Fallback: возвращаем 404
        logger.error(f"Media file not found: {file_path}")
        raise Http404(f"Media file not found: {file_path}")
    
    # Добавляем маршрут для прокси медиа файлов
    media_urlpatterns = [
        re_path(r'^media/(?P<path>.*)$', media_proxy, name='media_proxy'),
    ]

urlpatterns = media_urlpatterns + [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.api.urls")),
    path("api/post/", include("post.api.urls")),
    path("api/post/", include("post.api.route_urls")),
    path("api/admin/", include("admin_api.urls")),
    path("api/v1/user/notifications/unread_count/", unread_notifications_count),
]

# Обслуживание статических файлов в режиме разработки
if settings.DEBUG:
    # Статические файлы всегда обслуживаются через Django в DEBUG режиме
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Медиа файлы: если НЕ используется S3, обслуживаем локально
    if not use_s3 and settings.MEDIA_ROOT:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
