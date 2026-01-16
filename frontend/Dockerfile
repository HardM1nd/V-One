FROM oven/bun:latest

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей через bun
RUN bun install

# Копирование остальных файлов
COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]

