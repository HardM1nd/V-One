FROM python:3.12-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копирование файлов зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Создание директорий для медиа и статических файлов
RUN mkdir -p media staticfiles

EXPOSE 8000

# Запуск сервера (миграции и collectstatic выполняются в docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

