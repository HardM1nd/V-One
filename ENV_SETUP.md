# Настройка переменных окружения

## Для Docker (рекомендуется)

Создайте файл `.env` в **корне проекта** (рядом с `docker-compose.yml`):

```bash
# В корне проекта V-One/
cp .env.example .env
nano .env  # или любой другой редактор
```

Docker Compose автоматически прочитает переменные из этого файла.

## Для локального запуска без Docker

Если запускаете backend локально через `python manage.py runserver`:

```bash
# В папке backend/
cd backend
cp .env.example .env
nano .env  # или любой другой редактор
```

## Структура файлов

```
V-One/
├── .env              ← для Docker (docker-compose)
├── .env.example      ← шаблон для Docker
├── docker-compose.yml
├── backend/
│   ├── .env          ← для локального запуска (если без Docker)
│   └── .env.example  ← шаблон для локального запуска
└── frontend/
```

**Итого:** 
- **Docker** → `.env` в **корне проекта**
- **Локально** → `.env` в `backend/`
