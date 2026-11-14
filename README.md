# V-One

V-One — социальная сеть и платформа для обмена публикациями, маршрутами и профилями пользователей. Проект объединяет Django REST API на бэкенде и React + Vite на фронтенде, а также готовую Docker-конфигурацию для локальной разработки и деплоя.

## Что реализовано

- Регистрация, логин и JWT-аутентификация
- Профили пользователей с аватаром, обложкой и настройками
- Подписки и подписчики
- Лента постов, комментарии, лайки, сохранения
- Оповещения и счетчик непрочитанных уведомлений
- Создание, просмотр и оценка маршрутов/путевых заметок
- Административная панель и метрики активности
- Сохранение медиа в MinIO/S3 и статических файлов через Django/WhiteNoise

## Архитектура проекта

- Backend: Django 5 + Django REST Framework + PostgreSQL/SQLite
- Frontend: React 18 + Vite + Tailwind CSS + Radix UI
- Дополнительно: MinIO для медиа, Caddy для HTTPS в продакшене

## Структура репозитория

```text
.
├── backend/                 # Django API
│   ├── accounts/            # Пользователи, профили, подписки, уведомления
│   ├── admin_api/           # Админские API и метрики
│   ├── core/                # Настройки проекта и URL-конфиг
│   ├── post/                # Посты, комментарии, лайки, маршруты
│   ├── manage.py            # Django CLI
│   ├── requirements.txt      # Python зависимости
│   └── scripts/             # Скрипты окружения и инициализации
├── frontend/                # React-приложение
│   ├── src/                 # Исходный код UI
│   ├── public/              # Статика
│   ├── package.json         # Скрипты и зависимости фронта
│   └── vite.config.mjs     # Конфигурация Vite
├── minio/                   # Образ MinIO для продакшена
├── .env.example             # Пример переменных окружения
├── docker-compose.yml       # Локальный стек для разработки
├── docker-compose.prod.yml  # Продакшн стек
├── Caddyfile                # Конфиг Caddy для HTTPS
├── README.md                # Документация проекта
└── .gitignore
```

## Требования

### Для локального запуска через Docker

- Docker
- Docker Compose

### Для запуска без Docker

- Python 3.10+
- Bun 1.x или Node.js 18+
- pip / uv

## Быстрый старт с Docker

1. Скопируйте пример `.env`:

```bash
cp .env.example .env
```

2. Проверьте и при необходимости заполните переменные окружения:

- `DJANGO_SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `USE_SQLITE` (`True` для SQLite, `False` для PostgreSQL)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `USE_S3`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET_NAME`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_ENDPOINT_URL`
- `VITE_API_URL`

3. Запустите проект:

```bash
docker compose up --build
```

4. Доступные сервисы:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Django admin: `http://localhost:8000/admin`
- MinIO console: `http://localhost:9001`
- MinIO API: `http://localhost:9000`

> Примечание: для локальной разработки в `docker-compose.yml` используется сервис `backend` и `frontend` с live reload. Бэкенд автоматически выполняет миграции и собирает статику.

## Продакшн деплой

В продакшене используется `docker-compose.prod.yml` с:

- PostgreSQL
- MinIO/S3
- Django через Gunicorn
- React через Nginx
- Caddy для автоматического HTTPS

Подготовка:

```bash
cp .env.example .env
# заполните .env корректными секретами и доменом

docker compose -f docker-compose.prod.yml up -d --build
```

Для корректной работы укажите `DOMAIN` в `.env` и откройте порты `80`, `443`, `8000` на сервере. Caddy автоматически запросит и обновит TLS-сертификат для указанного домена.

## Запуск без Docker

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# или .venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
bun install
bun run dev
```

или через npm, если Bun недоступен:

```bash
cd frontend
npm install
npm run dev
```

## Основные API-эндпоинты

- `POST /api/accounts/signup/` — регистрация
- `POST /api/accounts/token/` — получение JWT
- `POST /api/accounts/token/refresh/` — обновление JWT
- `GET /api/accounts/info/` — информация о текущем пользователе
- `GET /api/accounts/<id>/following/` — подписки пользователя
- `GET /api/accounts/<id>/followers/` — подписчики пользователя
- `POST /api/accounts/follow_unfollow/<id>/` — подписка/отписка
- `GET /api/post/all/` — лента постов
- `POST /api/post/create/` — создание поста
- `GET /api/post/<id>/comments/` — комментарии к посту
- `POST /api/post/<id>/like/` — лайк/анлайк поста
- `POST /api/post/<id>/save/` — сохранение/отмена сохранения
- `GET /api/post/routes/` — список маршрутов
- `POST /api/post/routes/create/` — создание маршрута
- `GET /api/admin/` — административный API

## Технологический стек

### Backend

- Django 5.x
- Django REST Framework
- SimpleJWT
- PostgreSQL / SQLite
- django-cors-headers
- django-cleanup
- Pillow
- MinIO/S3 storage via `django-storages`

### Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- Radix UI
- Axios
- Leaflet (карты/маршруты)

## Разработка и отладка

- Для продакшена используйте сильные секреты и уберите `DEBUG=True`
- Для разработки удобно оставлять `USE_SQLITE=True`
- Для S3/MinIO проверьте `AWS_S3_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Если нужен рабочий MinIO bucket, можно запустить:

```bash
docker compose --profile init up minio-init
```

## Скриншоты и демонстрация

### Регистрация

![Регистрация](https://github.com/user-attachments/assets/5eb54462-b869-4ac6-a2a3-b4a013eb8fe8)

### Публикация постов

![Посты](https://github.com/user-attachments/assets/24e05480-d098-48ef-9e6c-6566099476ca)

### Система уведомлений

![Уведомления](https://github.com/user-attachments/assets/d5756a06-0cf5-4179-b503-ab3a51a02914)

### Пользовательские маршруты

![Маршруты](https://github.com/user-attachments/assets/f232b16e-3077-49eb-b967-66e2ffdb9d69)

### Система профилей

![Профили](https://github.com/user-attachments/assets/dffd0aa5-9548-4b82-b82e-d5f97b341025)

## Полезные ссылки

- Документация Django: https://docs.djangoproject.com/
- React: https://react.dev/
- Vite: https://vite.dev/
- Tailwind CSS: https://tailwindcss.com/
