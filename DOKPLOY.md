# Деплой V-One с помощью Dokploy

Это руководство поможет вам развернуть приложение V-One на Dokploy.

## Предварительные требования

1. Установленный и настроенный Dokploy
2. Доступ к PostgreSQL базе данных
3. Git репозиторий с вашим кодом

## Подготовка

### 1. Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```bash
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,backend

# Database
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
USE_SQLITE=False

# Frontend
VITE_API_URL=https://api.your-domain.com
VITE_MEDIA_URL=https://minio.your-domain.com
```

**Важно:** 
- `DJANGO_SECRET_KEY` должен быть уникальным и секретным
- `ALLOWED_HOSTS` должен содержать ваш домен
- `VITE_API_URL` должен указывать на URL вашего backend API
- `VITE_MEDIA_URL` должен указывать на публичный URL MinIO (или CDN), чтобы медиа не грузились с localhost

### 2. Настройка Dokploy

#### Вариант 1: Docker Compose (Рекомендуется)

1. В Dokploy создайте новое приложение
2. Выберите тип: **Docker Compose**
3. Укажите путь к файлу: `docker-compose.prod.yml`
4. Добавьте переменные окружения из `.env` файла в настройках приложения
5. Запустите деплой

#### Вариант 2: Отдельные сервисы

##### Backend сервис:

1. Создайте новое приложение в Dokploy
2. Тип: **Dockerfile**
3. Dockerfile путь: `backend/Dockerfile.prod`
4. Контекст сборки: `backend/`
5. Порт: `8000`
6. Добавьте переменные окружения:
   - `DJANGO_SECRET_KEY`
   - `DEBUG=False`
   - `USE_SQLITE=False`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
   - `ALLOWED_HOSTS`

##### Frontend сервис:

1. Создайте новое приложение в Dokploy
2. Тип: **Dockerfile**
3. Dockerfile путь: `frontend/Dockerfile.prod`
4. Контекст сборки: `frontend/`
5. Build аргументы:
   - `VITE_API_URL=https://api.your-domain.com`
   - `VITE_MEDIA_URL=https://minio.your-domain.com`
6. Порт: `80`

## Настройка базы данных

### PostgreSQL

Убедитесь, что ваша PostgreSQL база данных доступна из контейнера. Если база данных находится на том же сервере Dokploy, используйте внутренний Docker network.

### Применение миграций

Миграции применяются автоматически при запуске backend контейнера. Если нужно применить миграции вручную:

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Создание суперпользователя

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## Настройка доменов и SSL

В Dokploy настройте:

1. **Backend**: Назначьте домен (например, `api.your-domain.com`) и включите SSL
2. **Frontend**: Назначьте домен (например, `your-domain.com`) и включите SSL

## Обновление CORS настроек

После настройки доменов, обновите `ALLOWED_HOSTS` и CORS настройки в `backend/core/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]
```

И пересоберите backend контейнер.

## Мониторинг и логи

В Dokploy вы можете:
- Просматривать логи контейнеров
- Мониторить использование ресурсов
- Настраивать автоматические перезапуски

## Обновление приложения

Для обновления приложения:

1. Загрузите новый код в Git репозиторий
2. В Dokploy нажмите "Redeploy" или "Rebuild"
3. При необходимости примените новые миграции

## Troubleshooting

### Backend не запускается

- Проверьте логи: `docker compose -f docker-compose.prod.yml logs backend`
- Убедитесь, что все переменные окружения установлены
- Проверьте подключение к базе данных

### Frontend не подключается к Backend

- Проверьте, что `VITE_API_URL` правильно установлен
- Убедитесь, что CORS настроен правильно
- Проверьте, что backend доступен по указанному URL

### Статические файлы не загружаются

- Убедитесь, что `collectstatic` выполнен: `python manage.py collectstatic --noinput`
- Проверьте права доступа к директории `staticfiles`

## Дополнительные настройки

### Оптимизация производительности

- Увеличьте количество workers в gunicorn (в `docker-compose.prod.yml`)
- Настройте кэширование в nginx
- Используйте CDN для статических файлов

### Резервное копирование

Настройте регулярное резервное копирование:
- База данных PostgreSQL
- Медиа файлы (volume `backend-media`)
