# Быстрый старт

## 1. Создайте файл `.env` в корне проекта

**Важно:** Для Docker нужен `.env` в корне проекта (рядом с `docker-compose.yml`)

Скопируйте `.env.example` и заполните своими данными:

```bash
cp .env.example .env
```

Затем отредактируйте `.env` и укажите данные для подключения к вашей БД:
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь БД
- `DB_PASSWORD` - пароль БД
- `DB_HOST` - хост удаленного сервера с БД
- `DB_PORT` - порт (обычно 5432)
- `DJANGO_SECRET_KEY` - секретный ключ Django (можно сгенерировать случайный)

**Примечание:** Если запускаете без Docker (локально), создайте `.env` в папке `backend/`

## 2. Запустите проект

```bash
docker-compose up --build
```

## 3. Откройте в браузере

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin панель: http://localhost:8000/admin

## Создание суперпользователя (опционально)

Если нужно создать админа:

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Остановка

```bash
docker-compose down
```

