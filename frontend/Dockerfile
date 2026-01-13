FROM node:18-alpine

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm install --legacy-peer-deps

# Копирование остальных файлов
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

