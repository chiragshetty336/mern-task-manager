# MERN Task Manager

A full-stack Task Manager application built with the **MERN** stack (MongoDB, Express, React, Node.js), featuring user authentication, full CRUD functionality, filtering, pagination, and a clean Tailwind CSS interface.

This project was built as a hands-on learning exercise to understand how the MERN stack works end-to-end — from setting up a database, to building a secure REST API, to consuming it in a React frontend.

---

## Features

- **User Authentication** — Register and login with hashed passwords (bcrypt) and JWT-based sessions
- **Protected Routes** — Both backend API routes and frontend pages are protected; only logged-in users can access their own tasks
- **Task CRUD** — Create, read, update (edit/toggle complete), and delete tasks
- **Per-User Data Isolation** — Each user can only see and modify their own tasks
- **Input Validation** — Backend validates all incoming data (e.g., minimum password length, non-empty task titles) using `express-validator`
- **Filtering** — View All / Active / Completed tasks
- **Pagination** — Tasks are fetched in pages from the backend instead of all at once
- **Loading & Error States** — Clear UI feedback while data is loading or if a request fails
- **Custom React Hook** — Task-related logic (`useTasks`) is abstracted into a reusable hook, separate from UI code
- **Responsive, Styled UI** — Built with Tailwind CSS

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Database | **MongoDB Atlas** | Cloud-hosted NoSQL database storing users and tasks as documents |
| ODM | **Mongoose** | Defines schemas and provides an easier JS-based interface to MongoDB |
| Backend | **Node.js + Express** | REST API server handling auth, business logic, and routing |
| Auth | **bcryptjs + jsonwebtoken** | Password hashing and JWT-based session tokens |
| Validation | **express-validator** | Server-side validation of incoming request data |
| Frontend | **React (Vite)** | Component-based UI |
| Routing | **react-router-dom** | Client-side page navigation and route protection |
| HTTP Client | **axios** | Communicates with the backend API, auto-attaches auth tokens |
| Styling | **Tailwind CSS** | Utility-first CSS framework |
| API Testing | **Postman** | Used to manually test all backend endpoints before frontend integration |

---

## Project Structure

```
mern-project/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (username, hashed password)
│   │   └── Task.js          # Task schema (title, completed, linked user)
│   ├── routes/
│   │   ├── authRoutes.js    # /register and /login endpoints
│   │   └── taskRoutes.js    # CRUD endpoints for tasks (protected + paginated)
│   ├── middleware/
│   │   └── authMiddleware.js # Verifies JWT token on protected routes
│   ├── .env                  # Environment variables (NOT committed to Git)
│   ├── .gitignore
│   ├── package.json
│   └── server.js             # Entry point: Express app, MongoDB connection
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js              # Centralized API instance, auto-attaches JWT
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global auth state (login/logout/user)
    │   ├── hooks/
    │   │   └── useTasks.js           # Custom hook: all task data + actions
    │   ├── components/
    │   │   └── TaskItem.jsx          # Single task row (edit/toggle/delete UI)
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx         # Main task manager view
    │   ├── App.jsx                   # Routes + route protection
    │   └── main.jsx
    ├── .gitignore
    ├── package.json
    └── vite.config.js
```

---

## How It Works (Request Lifecycle)

1. User registers/logs in via the React frontend → request sent to `/api/auth/register` or `/api/auth/login`
2. Backend validates input, checks credentials, hashes/compares password with bcrypt
3. On successful login, backend signs a **JWT token** and returns it
4. Frontend stores the token in `localStorage` and in global auth context
5. For every subsequent API request, an axios interceptor automatically attaches the token as `Authorization: Bearer <token>`
6. Backend's `protect` middleware verifies the token before allowing access to task routes
7. Task routes always filter by the logged-in user's ID — so users only ever see their own data
8. Frontend renders the response, with loading and error states handled gracefully

---

## API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/register` | Create a new user account | No |
| POST | `/login` | Authenticate and receive a JWT token | No |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/?page=1&limit=5` | Get paginated tasks for the logged-in user | Yes |
| POST | `/` | Create a new task | Yes |
| PUT | `/:id` | Update a task's title and/or completed status | Yes |
| DELETE | `/:id` | Delete a task | Yes |

All protected routes require a header: `Authorization: Bearer <token>`

---

## Setup Instructions

### Prerequisites
- Node.js (LTS) installed
- A MongoDB Atlas account (free tier) with a cluster created

### 1. Clone the repository
```bash
git clone https://github.com/chiragshetty336/mern-task-manager.git
cd mern-task-manager/mern-project
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
PORT=5000
```

Run the backend:
```bash
node server.js
```

### 3. Frontend setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite provides (typically `http://localhost:5173`).

---

## Concepts Demonstrated

This project was built specifically to learn and apply the following concepts:

**Backend**
- RESTful API design
- MongoDB document modeling and relationships (referencing a `User` from a `Task`)
- Password hashing and JWT-based authentication
- Custom middleware for route protection
- Server-side input validation
- Pagination using `skip()` and `limit()`

**Frontend**
- Component-based architecture and props
- Controlled forms and conditional rendering
- React Context API for global state
- Custom hooks for reusable logic
- Derived state (computing filtered lists without extra state)
- Async state handling (loading, error, success)
- Client-side routing and protected routes

---

## Future Improvements

- Deploy frontend (Vercel/Netlify) and backend (Render/Railway) for a live demo
- Add due dates and priority levels for tasks
- Add search functionality
- Add unit/integration tests

---

## Author

**Chirag Shetty**
B.E. Computer Science, KLE Technological University, Hubballi
GitHub: [github.com/chiragshetty336](https://github.com/chiragshetty336)
