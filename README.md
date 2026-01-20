# TXT-ME Backend

Репозиторий содержит серверную логику проекта TXT-ME на базе AWS Lambda.

## Структура
- `auth/` — Регистрация, логин и администрирование пользователей.
- `posts/` — CRUD операции с пocтами.
- `comments/` — Управлениe комментариями.
- `users/` — Профили, аватары и настройки бeзопасности.
- `notifications/` — Управление уведомлениями по мейлу.
- `terraform/` - Универсальный шаблон переноса и развертывания БД.
- `workers/` - Воркеры-распределители трафика на Cloudflare.

## Деплой
Для обновления функции в облаке используйте скрипт `deploy.sh`:
\```bash
./deploy.sh users/UsersUpdateEmail
\```

## Перенос БД
Для локальной установки или установки на любой сервер используйте скрипт setup-bd.sh

## Лицензия
GPL-3.0

## Version w/o docker ##
## Prerequisites
- DynamoDB Local
- Node.js

## Quick Start

1. **Start DynamoDB Local:**
   ```bash
   java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Setup Database Tables:**
   ```bash
   node create-tables.mjs
   ```

4. **Start Local API Server:**
   ```bash
   npm start
   ```

## Configuration

### Frontend API Configuration

Update your frontend API configuration to point to the local server:

```javascript
// In <path>/TXT-ME/src/services/api.js
const API_BASE_URL = 'http://localhost:3001';

Use .env or export:
export VITE_API_URL=http://localhost:3001
then:
npm install (possible npm install -D @vitejs/plugin-react)
npm run build
```

### Available Endpoints

The local server will run at `http://localhost:3001` with the following endpoints:

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/profile` - Get user profile (requires x-user-id header)
- `POST /posts` - Create post
- `GET /posts` - List posts
- `GET /posts/recent` - Get recent posts
- `DELETE /posts/:postId` - Delete post
- `POST /comments` - Create comment
- `GET /comments/:postId` - List comments for post
- `DELETE /comments/:commentId` - Delete comment

### DynamoDB Local

DynamoDB Local runs at `http://localhost:8000`

View tables:
```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

Scan a table:
```bash
aws dynamodb scan --table-name CMS-Users --endpoint-url http://localhost:8000
```

## Development Workflow

1. **Backend**: Run `npm start` in this directory
2. **Frontend**: Run `http-server ./dist -c-1` in TXT-ME directory
3. **Access**: Open your frontend at `http://localhost:8080` (or whatever port http-server uses)

The frontend will call the local API server at `http://localhost:3001`, which will invoke Lambda handlers that connect to local DynamoDB at `http://localhost:8000`.

## Troubleshooting

### Port Already in Use
- Change PORT in `local-server.mjs` if 3001 is taken
- Update frontend API configuration accordingly

### Missing Dependencies
- Run `npm install` in the root directory
- Each Lambda function has its own package.json, but the local server imports them directly
