# Функционал для пилотов

## Что добавлено

### Backend

1. **Расширена модель User** (`backend/accounts/models.py`):
   - `pilot_type` - тип пилота (virtual/real/both)
   - `flight_hours` - часы налета
   - `aircraft_types` - типы самолетов (текстовое поле)
   - `license_number` - номер лицензии
   - `bio` - биография пилота

2. **Обновлены сериализаторы** (`backend/accounts/api/serializers.py`):
   - Добавлены новые поля в `UserSerializer`
   - Метод `get_aircraft_types_list()` для преобразования строки в список

3. **Новый API endpoint** (`backend/accounts/api/views.py`):
   - `PilotListAPIView` - список пилотов с фильтрацией
   - Фильтрация по типу пилота (virtual/real/both)
   - Сортировка по часам налета или имени

4. **URL маршруты** (`backend/accounts/api/urls.py`):
   - `/api/accounts/pilots/` - список пилотов

### Frontend

1. **Обновлен профиль** (`frontend/src/components/Profile/index.js`):
   - Отображение типа пилота
   - Часы налета
   - Типы самолетов
   - Номер лицензии
   - Биография

2. **Обновлены настройки** (`frontend/src/components/Profile/Settings.js`):
   - Форма для редактирования всех полей пилота

3. **Новый компонент** (`frontend/src/components/Pilots.js`):
   - Список всех пилотов
   - Фильтрация по типу
   - Сортировка

4. **Навигация** (`frontend/src/components/global/SideNav.js`):
   - Добавлена ссылка "Pilots" в меню

5. **Роутинг** (`frontend/src/App.js`):
   - Добавлен маршрут `/pilots/`

## Миграции

При первом запуске через Docker миграции будут созданы автоматически. Если нужно создать вручную:

```bash
docker compose exec backend python manage.py makemigrations accounts
docker compose exec backend python manage.py migrate
```

## Использование

1. После запуска проекта перейдите в профиль
2. Во вкладке "Update Profile" заполните информацию о себе как пилоте
3. Перейдите в раздел "Pilots" для просмотра всех пилотов
4. Используйте фильтры для поиска виртуальных или реальных пилотов

## Следующие шаги

- Добавить функционал для маршрутов полетов (будет добавлен позже)

