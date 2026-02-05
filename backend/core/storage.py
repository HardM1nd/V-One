"""
Custom storage backends for S3/MinIO
"""
import os
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class MediaStorage(S3Boto3Storage):
    """Custom storage for media files with proper URL generation for MinIO"""
    location = ''
    file_overwrite = False
    default_acl = 'public-read'

    def url(self, name):
        """
        Return the URL for the file.
        По умолчанию ВСЕГДА используем Django‑прокси (/media/...), чтобы:
        - не требовать публичного доступа к бакету (AWS S3 / MinIO)
        - не ловить AccessDenied в браузере при неверной политике бакета
        Прямые ссылки на S3/MinIO включаются только при явном флаге
        USE_DIRECT_MEDIA_URLS=true в переменных окружения.
        """
        if not name:
            return ''

        # Remove leading slash from name if present
        name = name.lstrip('/')

        debug = getattr(settings, 'DEBUG', False)
        use_direct = os.getenv('USE_DIRECT_MEDIA_URLS', 'False').lower() == 'true'

        # По умолчанию (и всегда в DEBUG) ходим через Django‑прокси
        # /media/<path>, который уже сам достанет файл из S3/MinIO с
        # использованием server-side credential'ов.
        if debug or not use_direct:
            return f"/media/{name}"

        # In production, try to use direct MinIO URL
        public_url = os.getenv('AWS_S3_PUBLIC_URL', getattr(settings, 'AWS_S3_PUBLIC_URL', None))
        bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'media'))
        custom_domain = os.getenv('AWS_S3_CUSTOM_DOMAIN', getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None))
        
        # If we have a public URL, use it directly
        if public_url and public_url.strip():
            # Construct URL: http://localhost:9000/bucket_name/path/to/file
            url = f"{public_url.rstrip('/')}/{bucket_name}/{name}"
            return url
        
        # If we have custom domain, use it
        if custom_domain and custom_domain.strip():
            # Add http:// if not present
            if not custom_domain.startswith('http'):
                custom_domain = f"http://{custom_domain}"
            url = f"{custom_domain.rstrip('/')}/{bucket_name}/{name}"
            return url
        
        # Fallback: use Django proxy even in production if no public URL is configured
        # This ensures media files are always accessible
        return f"/media/{name}"
