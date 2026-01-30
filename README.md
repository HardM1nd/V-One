# V-One

Учебный проект - социальная сеть с постами, лайками и подписками.

## Структура проекта

Проект состоит из двух частей:
- **Backend** - Django REST API (Python)
- **Frontend** - React приложение (JavaScript)

## Требования

### Backend
- Python >= 3.10
- pip или uv для управления зависимостями

### Frontend
- Bun >= 1.0.0

## Быстрый запуск с Docker

1. Создайте файл `.env` в **корне проекта** (рядом с `docker-compose.yml`):
```bash
cp .env.example .env
```

2. Отредактируйте `.env` и заполните данные для подключения к удаленной БД:
   - `DB_NAME` - имя базы данных
   - `DB_USER` - пользователь БД
   - `DB_PASSWORD` - пароль БД
   - `DB_HOST` - хост удаленного сервера с БД
   - `DB_PORT` - порт (обычно 5432)
   - `DJANGO_SECRET_KEY` - секретный ключ Django
   - `USE_S3` - использовать MinIO для хранения медиа (по умолчанию: `True`)
   - `MINIO_ROOT_USER` - пользователь MinIO (по умолчанию: `minioadmin`)
   - `MINIO_ROOT_PASSWORD` - пароль MinIO (по умолчанию: `minioadmin`)
   - `MINIO_BUCKET_NAME` - имя bucket для медиа файлов (по умолчанию: `media`)
   - `MINIO_PUBLIC_URL` - публичный URL MinIO (по умолчанию: `http://localhost:9000`)

2. Инициализируйте MinIO bucket (опционально, выполняется автоматически):
```bash
docker compose --profile init up minio-init
```

3. Запустите проект:
```bash
docker compose up --build
```

4. Проект будет доступен:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`
   - Admin панель: `http://localhost:8000/admin`
   - MinIO Console: `http://localhost:9001` (логин/пароль из MINIO_ROOT_USER/MINIO_ROOT_PASSWORD)
   - MinIO API: `http://localhost:9000`

## Установка и запуск без Docker

### Backend

1. Перейдите в директорию backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Создайте файл `.env` в папке `backend/` и заполните данные для подключения к БД:
```bash
cd backend
cp .env.example .env
# Отредактируйте .env
```

5. Примените миграции:
```bash
python manage.py migrate
```

6. Запустите сервер:
```bash
python manage.py runserver
```

### Frontend

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
bun install
```

3. Запустите сервер:
```bash
bun run dev
```

## API Endpoints

- `/api/accounts/` - управление аккаунтами
- `/api/post/` - управление постами
- `/admin/` - административная панель Django

## Технологии

### Backend
- Django 5.x
- Django REST Framework
- JWT аутентификация
- PostgreSQL (опционально) / SQLite (по умолчанию)

### Frontend
- React 19.x
- Material-UI
- React Router
- Axios
- Tailwind CSS

## Разработка

### Структура Backend
```
backend/
├── accounts/      # Приложение для управления пользователями
├── post/          # Приложение для управления постами
├── core/          # Основные настройки Django
└── manage.py      # Django management script
```

### Структура Frontend
```
frontend/
├── src/
│   ├── components/    # React компоненты
│   ├── contexts/      # React контексты
│   └── App.js         # Главный компонент
└── public/            # Статические файлы
```

## Примечания

- Для продакшена обязательно установите `DJANGO_SECRET_KEY` в переменных окружения
- `DEBUG=True` используется только для разработки
- По умолчанию используется SQLite, для продакшена рекомендуется PostgreSQL

## Демонстрация функционала

### Регистрация

<img width="557" height="364" alt="Screenshot 2026-01-30 201036" src="https://github.com/user-attachments/assets/5eb54462-b869-4ac6-a2a3-b4a013eb8fe8" />

### Публикация постов

<img width="623" height="654" alt="Screenshot 2026-01-30 201940" src="https://github.com/user-attachments/assets/24e05480-d098-48ef-9e6c-6566099476ca" />

### Система уведомлений

<img width="613" height="311" alt="image" src="https://github.com/user-attachments/assets/d5756a06-0cf5-4179-b503-ab3a51a02914" />

### Пользовательские маршруты

<img width="619" height="370" alt="image" src="https://github.com/user-attachments/assets/f232b16e-3077-49eb-b967-66e2ffdb9d69" />

### Система профилей

<img width="622" height="611" alt="image" src="https://github.com/user-attachments/assets/dffd0aa5-9548-4b82-b2ea-d5f97b341025" />
