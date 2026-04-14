# TaskManager

A full-stack Task Manager application built with **React**, **Django REST Framework**, **JWT Authentication**, and **PostgreSQL**. Users can register, log in, and perform full CRUD operations on their personal tasks.

---

## Live Demo

| Service | URL |
|---------|-----|
| React App | http://localhost:3000 |
| Django API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/api/docs/ |
| ReDoc | http://localhost:8000/api/redoc/ |
| OpenAPI Schema | http://localhost:8000/api/schema/ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Django 4.2, Django REST Framework 3.14 |
| Authentication | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL 14 |
| API Docs | drf-spectacular (Swagger UI + ReDoc) |
| Styling | Inline styles (no external CSS framework) |

---

## Project Structure

```
TaskManager/
├── README.md
│
├── backend/                          # Django project
│   ├── .env                          # Environment variables (not committed)
│   ├── .gitignore
│   ├── manage.py
│   ├── requirements.txt
│   │
│   ├── task_manager/                 # Django project config
│   │   ├── settings.py               # DB, CORS, JWT, Swagger config
│   │   ├── urls.py                   # Root URL router
│   │   └── wsgi.py
│   │
│   └── tasks/                        # Main Django app
│       ├── models.py                 # Task model
│       ├── serializers.py            # JSON ↔ Python (Register + Task)
│       ├── views.py                  # API views with Swagger annotations
│       ├── urls.py                   # API URL patterns
│       ├── admin.py                  # Django admin config
│       └── migrations/
│           └── 0001_initial.py
│
└── frontend/                         # React application
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                  # React entry point
        ├── index.css                 # Global reset styles
        ├── App.jsx                   # Routing + auth gating
        │
        ├── api/
        │   ├── axiosInstance.js      # Axios client + JWT interceptor
        │   ├── authService.js        # Register / Login / Logout API calls
        │   └── taskService.js        # Task CRUD API calls
        │
        ├── components/
        │   ├── Navbar.jsx            # Top navigation bar
        │   ├── TaskCard.jsx          # Single task display card
        │   ├── TaskForm.jsx          # Add / Edit task form
        │   └── Spinner.jsx           # Loading indicator
        │
        └── pages/
            ├── LoginPage.jsx         # Login form
            ├── RegisterPage.jsx      # Registration form
            └── Dashboard.jsx         # Main task management page
```

---

## Features

- **User Authentication** — Register, login, and logout with JWT tokens
- **Auto Token Refresh** — Axios interceptor silently refreshes expired access tokens
- **Protected Routes** — Unauthenticated users are redirected to `/login`
- **Task CRUD** — Create, read, update, and delete tasks
- **Toggle Completion** — Check/uncheck tasks directly from the list
- **Task Filtering** — Filter tasks by All / Pending / Completed
- **User Isolation** — Users can only see and manage their own tasks
- **Swagger UI** — Interactive API documentation with "Try it out" support
- **Loading States** — Spinner shown during API calls
- **Error Handling** — User-friendly error messages on API failures

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Create a new user account |
| POST | `/api/auth/login/` | No | Login and receive JWT tokens |
| POST | `/api/auth/token/refresh/` | No | Get a new access token using refresh token |
| POST | `/api/auth/logout/` | Yes | Blacklist refresh token (server-side logout) |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks/` | Yes | List all tasks for the logged-in user |
| POST | `/api/tasks/` | Yes | Create a new task |
| GET | `/api/tasks/<id>/` | Yes | Retrieve a single task |
| PUT | `/api/tasks/<id>/` | Yes | Fully update a task |
| PATCH | `/api/tasks/<id>/` | Yes | Partially update (e.g. toggle completed) |
| DELETE | `/api/tasks/<id>/` | Yes | Delete a task |

**Optional query param:** `GET /api/tasks/?completed=true` — filter by status.

---

## JWT Authentication Flow

```
1. POST /api/auth/login/  { username, password }
         │
         ▼
2. Django returns { access (60 min), refresh (7 days) }
         │
         ▼
3. React stores both tokens in localStorage
         │
         ▼
4. Every API request → Axios interceptor adds:
   Authorization: Bearer <access_token>
         │
         ▼
5. Access token expires → interceptor catches 401
   → auto POSTs to /api/auth/token/refresh/
   → gets new access token → retries original request
         │
         ▼
6. Refresh token expires → user redirected to /login
```

---

## Sample API Requests & Responses

**Register**
```bash
POST /api/auth/register/
Content-Type: application/json

{ "username": "alice", "email": "alice@example.com", "password": "secret123" }

# 201 Created
{ "id": 1, "username": "alice", "email": "alice@example.com" }
```

**Login**
```bash
POST /api/auth/login/
Content-Type: application/json

{ "username": "alice", "password": "secret123" }

# 200 OK
{
  "access":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Create Task**
```bash
POST /api/tasks/
Authorization: Bearer <access_token>
Content-Type: application/json

{ "title": "Buy groceries", "description": "Milk, bread, eggs" }

# 201 Created
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "created_at": "2026-04-14T10:00:00Z",
  "user": "alice"
}
```

**Toggle Task Complete**
```bash
PATCH /api/tasks/1/
Authorization: Bearer <access_token>
Content-Type: application/json

{ "completed": true }

# 200 OK
{ "id": 1, "title": "Buy groceries", "completed": true, ... }
```

---

## Local Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE taskmanager_db;"

# 5. Configure environment variables
cp .env.example .env            # then edit .env with your DB credentials

# 6. Run migrations
python manage.py makemigrations tasks
python manage.py migrate

# 7. (Optional) Create a superuser for the admin panel
python manage.py createsuperuser

# 8. Start the server
python manage.py runserver
# Django runs at http://localhost:8000
```

### Frontend Setup

```bash
# In a new terminal tab
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
# React runs at http://localhost:3000
```

---

## Environment Variables

Create a `backend/.env` file with the following:

```env
SECRET_KEY=your-very-secret-django-key-change-me-in-production
DEBUG=True

DB_NAME=taskmanager_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

> Never commit `.env` to version control — it is already in `.gitignore`.

---

## Swagger / API Documentation

Once the backend is running, visit:

- **Swagger UI** → `http://localhost:8000/api/docs/`
- **ReDoc** → `http://localhost:8000/api/redoc/`

**How to authorize in Swagger UI:**

1. Open `http://localhost:8000/api/docs/`
2. Use `POST /api/auth/login/` → click **Try it out** → enter credentials → **Execute**
3. Copy the `access` value from the response
4. Click the **Authorize** button (top right)
5. Enter: `Bearer <paste_access_token_here>`
6. All protected endpoints now work with the lock icon

---

## React Concepts Covered

| Concept | Where Used |
|---------|-----------|
| `useState` | All pages — form fields, loading, errors, task list |
| `useEffect` | `Dashboard.jsx` — fetches tasks on mount and when filter changes |
| Controlled components | `TaskForm.jsx` — every input synced with state |
| Conditional rendering | `TaskCard.jsx` — strikethrough + badges based on `completed` |
| Props & callbacks | `TaskCard` → `onEdit`, `onDelete`, `onToggle` passed from `Dashboard` |
| Lifting state up | Logout logic owned by `App.jsx`, triggered via prop from `Navbar` |
| Protected routes | `ProtectedRoute` component in `App.jsx` |
| React Router | `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate` |
| API integration | `axiosInstance.js` — single client with interceptors |
| Component composition | `Dashboard` composes `Navbar` + `TaskForm` + `TaskCard` + `Spinner` |

---

## Django Concepts Covered

| Concept | Where Used |
|---------|-----------|
| Models & migrations | `tasks/models.py` — Task with ForeignKey to User |
| Serializers | `tasks/serializers.py` — `RegisterSerializer`, `TaskSerializer` |
| Class-based views | `generics.ListCreateAPIView`, `RetrieveUpdateDestroyAPIView` |
| ViewSets / permissions | `IsAuthenticated` on all task endpoints, `AllowAny` on register |
| JWT authentication | `simplejwt` — `TokenObtainPairView`, `TokenRefreshView` |
| Object-level auth | `get_queryset()` filters by `request.user` — no cross-user access |
| CORS | `django-cors-headers` allows requests from `localhost:3000` |
| OpenAPI / Swagger | `drf-spectacular` with `@extend_schema` annotations on all views |
| Django admin | `tasks/admin.py` — Task visible in `/admin/` panel |

---

## Security Notes

- Passwords are hashed using Django's default PBKDF2 algorithm — never stored in plain text
- JWT access tokens expire after 60 minutes; refresh tokens after 7 days
- Object-level authorization prevents users from accessing other users' tasks
- `SECRET_KEY` and database credentials are loaded from `.env` — never hard-coded
- CORS is restricted to `localhost:3000` only

---

## License

MIT
