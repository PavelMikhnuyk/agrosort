# 🌾 AgroSort — Интернет-портал учёта сортов сельскохозяйственных культур

Полноценное веб-приложение с Node.js + Express бэкендом, PostgreSQL базой данных и HTML/CSS/JS фронтендом.

---

## 📁 Структура проекта

```
agrosort/
├── backend/
│   ├── config/
│   │   └── database.js          # Настройка Sequelize + PostgreSQL
│   ├── src/
│   │   ├── models/              # Модели данных (User, Culture, Variety, Favorite)
│   │   ├── controllers/         # Бизнес-логика (auth, variety, culture, favorite)
│   │   ├── routes/              # API маршруты
│   │   ├── middleware/          # JWT авторизация, RBAC
│   │   ├── seeders/             # Начальные данные
│   │   └── index.js             # Точка входа Express
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html               # Главная страница
│   ├── css/main.css             # Стили
│   ├── js/
│   │   ├── api.js               # HTTP-клиент
│   │   └── auth.js              # Управление сессией
│   └── pages/
│       ├── catalog.html         # Каталог сортов с фильтрами
│       ├── variety.html         # Карточка сорта
│       ├── add-variety.html     # Форма добавления/редактирования
│       ├── dashboard.html       # Личный кабинет
│       ├── login.html           # Вход
│       └── register.html        # Регистрация
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🚀 Быстрый старт

### Вариант 1: Docker (рекомендуется)

```bash
# 1. Клонируйте / распакуйте проект
cd agrosort

# 2. Запустите всё одной командой
docker-compose up -d

# 3. Заполните базу тестовыми данными
docker exec agrosort_api node src/seeders/seed.js

# 4. Откройте в браузере
open http://localhost:3000
```

### Вариант 2: Локально

```bash
# Требования: Node.js 18+, PostgreSQL 14+

# 1. Создайте базу данных
psql -U postgres -c "CREATE DATABASE agrosort;"

# 2. Настройте .env (отредактируйте параметры БД)
cp .env .env.local

# 3. Установите зависимости
cd backend && npm install

# 4. Заполните базу начальными данными
npm run seed

# 5. Запустите сервер
npm run dev  # режим разработки с hot-reload
# или
npm start    # продакшн режим
```

---

## 🔑 Тестовые аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| admin@agrosort.ru | Admin123! | Администратор |
| agronomist@agrosort.ru | Agro123! | Агроном |

---

## 🌐 Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная страница |
| `/pages/catalog.html` | Каталог сортов с поиском и фильтрами |
| `/pages/variety.html?id=1` | Карточка сорта |
| `/pages/login.html` | Вход |
| `/pages/register.html` | Регистрация |
| `/pages/dashboard.html` | Личный кабинет |
| `/pages/add-variety.html` | Добавить сорт |
| `/pages/edit-variety.html?id=1` | Редактировать сорт |

---

## 📡 API Endpoints

### Авторизация
```
POST /api/auth/register    — регистрация
POST /api/auth/login       — вход, возвращает JWT
GET  /api/auth/me          — текущий пользователь
PUT  /api/auth/profile     — обновить профиль
```

### Сорта
```
GET    /api/varieties            — список (фильтры, пагинация, поиск)
GET    /api/varieties/stats      — статистика
GET    /api/varieties/:id        — детальная карточка
POST   /api/varieties            — создать (agronomist, admin)
PUT    /api/varieties/:id        — обновить (автор или admin)
DELETE /api/varieties/:id        — удалить (автор или admin)
```

### GET /api/varieties — параметры запроса
| Параметр | Описание | Пример |
|----------|----------|--------|
| search | Поиск по названию/оригинатору | `?search=московская` |
| cultureId | Фильтр по культуре | `?cultureId=1` |
| category | Категория культуры | `?category=grain` |
| status | Статус | `?status=active` |
| yearFrom / yearTo | Диапазон лет | `?yearFrom=2000&yearTo=2020` |
| region | Регион допуска | `?region=Центральный` |
| sortBy | Поле сортировки | `?sortBy=yearRegistered` |
| sortDir | Направление | `?sortDir=DESC` |
| page / limit | Пагинация | `?page=2&limit=20` |

### Культуры
```
GET    /api/cultures        — список с количеством сортов
GET    /api/cultures/:id    — детали
POST   /api/cultures        — создать (admin only)
PUT    /api/cultures/:id    — обновить (admin only)
DELETE /api/cultures/:id    — удалить (admin only)
```

### Избранное
```
GET    /api/favorites           — мои избранные сорта
POST   /api/favorites/:varietyId — добавить/убрать (toggle)
```

---

## 🗄️ Модели данных

### Variety (Сорт)
- name, registrationNumber, status (active/excluded/pending)
- cultureId — связь с Culture
- yearRegistered, yearExcluded
- breeder, originCountry
- yieldMin, yieldMax, yieldUnit
- vegetationDays
- frostResistance, droughtResistance, diseaseResistance (1–5)
- admittedRegions (массив строк)
- description, characteristics (JSONB)

### Culture (Культура)
- name, nameScientific, category, icon, description

### User (Пользователь)
- email, password (bcrypt), name, role (admin/agronomist/viewer)
- organization, region, isActive

### Favorite (Избранное)
- userId, varietyId, note

---

## 🔐 Роли и права

| Действие | viewer | agronomist | admin |
|----------|--------|------------|-------|
| Просмотр каталога | ✅ | ✅ | ✅ |
| Просмотр карточки | ✅ | ✅ | ✅ |
| Избранное | ✅ | ✅ | ✅ |
| Добавить сорт | ❌ | ✅ | ✅ |
| Редактировать свой сорт | ❌ | ✅ | ✅ |
| Редактировать любой сорт | ❌ | ❌ | ✅ |
| Управление культурами | ❌ | ❌ | ✅ |

---

## 🚢 Деплой на сервер (VPS/Ubuntu)

```bash
# Установите Docker
curl -fsSL https://get.docker.com | sh

# Скопируйте проект на сервер
scp -r agrosort/ user@your-server:/opt/agrosort

# На сервере
cd /opt/agrosort
# Отредактируйте .env — смените JWT_SECRET!
nano .env
docker-compose up -d
docker exec agrosort_api node src/seeders/seed.js
```

Для HTTPS добавьте Nginx + Certbot перед приложением.

---

## 🛠️ Разработка

```bash
cd backend
npm run dev        # nodemon — hot reload

# Пересоздать таблицы и залить тестовые данные
npm run seed
```
