# 📋 Personal Task Manager

A full-stack backend-based Personal Task Manager that allows authenticated users to manage their daily tasks efficiently. Built with **React + MUI** on the frontend and **Node.js + Express + Firebase Firestore** on the backend.

---

## 🚀 Features

- 🔐 **Secure Authentication** — Register & Login with JWT-based auth (bcrypt password hashing)
- ✅ **Task Management** — Create, Read, Update, Delete tasks
- 🌳 **Recursive Subtasks** — Nest subtasks inside tasks (infinite depth)
- 🏷️ **Priority Tracking** — High, Medium, Low priority levels with color indicators
- 📊 **Status Tracking** — Pending, In Progress, Completed
- ⚠️ **Overdue Detection** — Automatically flags tasks past their due date
- 🔍 **Filtering** — Filter by status and priority
- 🔃 **Sorting** — Sort by creation date or due date
- 📄 **Pagination** — Server-side pagination (10 tasks per page)
- 🔒 **User Isolation** — Users can only access and manage their own tasks

---
<img width="837" height="559" alt="Screenshot 2026-05-29 123449" src="https://github.com/user-attachments/assets/dbbbffdf-8263-45d6-bcf2-97cb90e0f0c8" />
<img width="682" height="585" alt="Screenshot 2026-05-29 123454" src="https://github.com/user-attachments/assets/8803d2cb-973f-4c63-bb6c-dac87d8e6bcb" />


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Material UI (MUI v9) |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Routing | React Router v7 |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase initialization
│   ├── controllers/
│   │   ├── taskController.js    # Task CRUD logic
│   │   └── userController.js    # Register & Login logic
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT protect middleware
│   ├── routes/
│   │   ├── taskRoutes.js        # /api/tasks routes
│   │   └── userRoutes.js        # /api/users routes
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AuthPage.jsx     # Login & Register UI
    │   │   └── Dashboard.jsx    # Main task dashboard
    │   ├── App.jsx              # Routes setup
    │   └── main.jsx
    ├── .env                     # VITE_API_URL
    └── vite.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v18+
- npm
- Firebase project (Firestore enabled)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
JWT_SECRET=your_super_secret_key
```

Add your Firebase config in `config/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

Start the backend:

```bash
npm start
# Server runs on http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Add proxy in `vite.config.js` to avoid CORS issues:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

Start the frontend:

```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🔌 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/users/register` | Register new user | ❌ |
| POST | `/api/users/login` | Login & get JWT token | ❌ |

#### Register Request Body
```json
{
  "name": "Ayush",
  "email": "ayush@example.com",
  "password": "yourpassword"
}
```

#### Login Request Body
```json
{
  "email": "ayush@example.com",
  "password": "yourpassword"
}
```

#### Auth Response
```json
{
  "_id": "userId",
  "name": "Ayush",
  "email": "ayush@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Task Endpoints

All task routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks (with filters & pagination) |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

#### GET /api/tasks — Query Parameters

| Param | Type | Description | Example |
|---|---|---|---|
| `status` | string | Filter by status | `pending`, `in-progress`, `completed` |
| `priority` | string | Filter by priority | `high`, `medium`, `low` |
| `sortBy` | string | Sort field | `createdAt` (default), `dueDate` |
| `page` | number | Page number | `1` |
| `limit` | number | Items per page | `10` |
<img width="725" height="483" alt="Screenshot 2026-05-29 123515" src="https://github.com/user-attachments/assets/ad89acd4-9f9e-47f3-8bc6-157e76cd4658" />

#### GET /api/tasks — Response
```json
{
  "tasks": [
    {
      "id": "taskId",
      "title": "Complete assignment",
      "description": "Finish the task manager project",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-06-01",
      "parentId": null,
      "isOverdue": false,
      "createdAt": "..."
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

#### POST /api/tasks — Request Body
```json
{
  "title": "My Task",
  "description": "Optional description",
  "priority": "high",
  "dueDate": "2026-06-15",
  "status": "pending",
  "parentId": null
}
```

> Set `parentId` to a task's ID to create a **subtask**.

---
<img width="1481" height="912" alt="Screenshot 2026-05-29 123506" src="https://github.com/user-attachments/assets/749eeec4-59af-486c-ba04-1f22572d71de" />


## 🗺️ Frontend Pages

### `/auth` — Authentication Page
- Login with email & password
- Register with name, email & password
- JWT token stored in `localStorage`

### `/dashboard` — Task Dashboard
- **Stats bar** — Total, Pending, Completed, Overdue counts
- **Filters** — Status, Priority, Sort, Search (client-side)
- **Task cards** — Priority color border, overdue badge, status dropdown
- **Subtasks** — Click `+` on any task to add a subtask; expand/collapse with count badge
- **Pagination** — Navigate pages from backend
- **Create/Edit Dialog** — Full form with title, description, priority, status, due date

---

## 🔒 Security

- Passwords are hashed using **bcryptjs** (salt rounds: 10)
- JWT tokens expire in **30 days**
- Every task API route is protected by the `protect` middleware
- Tasks are scoped to the authenticated user — users cannot access others' tasks
- Frontend redirects to `/auth` if no token is found in localStorage

---

## 🧪 Testing the API (with curl)

```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ayush","email":"ayush@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ayush@test.com","password":"123456"}'

# Get Tasks (replace TOKEN)
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Create Task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","priority":"high","status":"pending"}'
```

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| Tasks not showing after create | Check backend is running on port 5000 |
| CORS error | Add proxy in `vite.config.js` or enable CORS in backend |
| `401 Not authorized` | Token expired or missing — logout and login again |
| Firebase error | Check `firebaseConfig` values in `config/firebase.js` |
| `src refspec main does not match` | Run `git add . && git commit -m "init"` before push |

---

## 📦 Build for Production

```bash
# Frontend build
cd frontend
npm run build
# Output in /dist folder

# Backend — deploy to Railway / Render / Heroku
# Set environment variables: PORT, JWT_SECRET
# Add Firebase config
```

---

## 👤 Author

**Ayush**
GitHub: [@ashuifh](https://github.com/ashuifh)

---

## 📄 License

This project is for educational/internship purposes.

---

## 🌿 Git Branch Strategy

This project follows a **3-branch workflow** for clean and organized development.

```
master
│
├── dev
│   └── feature
```

<img width="1888" height="682" alt="image" src="https://github.com/user-attachments/assets/86f0ba85-bfba-4ed5-87d8-bea7f608b24c" />

### Branch Overview

| Branch | Purpose | Merges Into |
|---|---|---|
| `master` | Production-ready stable code | — |
| `dev` | Integration branch for testing | `master` |
| `feature` | Active development of new features | `dev` |

---

### Branch Details

#### `master` — Production Branch
- Always stable and deployable
- No direct commits — only merged from `dev`
- Represents the latest released version

#### `dev` — Development Branch
- Integration branch where features are tested together
- All feature branches merge here first
- Merged into `master` only when fully tested and stable

#### `feature` — Feature Branch
- All new features and bug fixes are built here
- Branched off from `dev`
- Merged back into `dev` after completion

---

### Workflow Commands

```bash
# Start new feature from dev
git checkout dev
git checkout -b feature

# Work on your feature...
git add .
git commit -m "feat: add task filtering"

# Merge feature into dev
git checkout dev
git merge feature

# After testing, merge dev into master
git checkout master
git merge dev

# Push all branches
git push origin master
git push origin dev
git push origin feature
```

---

### Commit Convention Used

```
feat:     new feature added
fix:      bug fix
refactor: code restructured
docs:     documentation update
chore:    config or setup changes
```

**Examples:**
```bash
git commit -m "feat: add recursive subtask support"
git commit -m "fix: task not showing after create"
git commit -m "docs: update README with branch strategy"
git commit -m "refactor: move api calls to separate file"
```
