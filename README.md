# Real-Time Tutor Booking System

A full-stack web application for connecting students with tutors, featuring real-time booking workflows, learning outcome tracking, and admin analytics.

---

## 📋 Project Overview

This platform enables students to discover tutors based on subject expertise, budget, and availability. Tutors can accept or decline booking requests in real-time, and students can provide feedback after sessions to track their learning progress.

### Key Features

- **Tutor Discovery** - Search and filter tutors by subject, budget, and availability with a smart matching algorithm
- **Real-Time Booking** - State machine workflow: Requested → Accepted/Rejected → Completed
- **Feedback System** - Star ratings, comments, and learning outcome tracking (before/after skill levels)
- **Admin Dashboard** - Platform analytics, tutor effectiveness metrics, and alerts

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│   │   Tutor     │  │   Booking   │  │  Feedback   │  │  Admin  │ │
│   │  Discovery  │  │    Flow     │  │    Page     │  │Dashboard│ │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
│          │                │                │              │      │
│   ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐       │      │
│   │useTutorSearch│ │ useBooking │  │ useFeedback │        │      │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │      │
│          └────────────────┴────────────────┴──────────────┘      │
│                                    │                              │
│                           HTTP/REST API                           │
└────────────────────────────────────┬─────────────────────────────┘
                                     │
┌────────────────────────────────────┴─────────────────────────────┐
│                       BACKEND (Express.js)                        │
├──────────────────────────────────────────────────────────────────┤
│   ┌──────────────────────────────────────────────────────────┐   │
│   │                      Middleware                           │   │
│   │              (Auth / Validation / CORS)                   │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│   │   Tutor     │  │   Booking   │  │  Feedback   │  │  Admin  │ │
│   │ Controller  │  │ Controller  │  │ Controller  │  │Controller│ │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
│          └────────────────┴────────────────┴───────────────┘      │
│                                    │                              │
│                           PostgreSQL Driver                       │
└────────────────────────────────────┬─────────────────────────────┘
                                     │
┌────────────────────────────────────┴─────────────────────────────┐
│                        DATABASE (PostgreSQL)                      │
├──────────────────────────────────────────────────────────────────┤
│   users │ tutors │ tutor_availability │ bookings │ feedback │     │
│                              learning_outcomes                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology     | Purpose                   |
| -------------- | ------------------------- |
| React 19       | UI framework              |
| Vite 7         | Build tool & dev server   |
| Tailwind CSS 3 | Utility-first CSS styling |

### Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Node.js    | Runtime environment   |
| Express.js | REST API framework    |
| PostgreSQL | Relational database   |
| JWT        | Authentication tokens |
| bcrypt     | Password hashing      |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Used By           |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Registration flow |
| POST   | `/api/auth/login`    | Login flow        |

### Tutors

| Method | Endpoint             | Used By                               |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/api/tutors`        | TutorDiscovery page (all tutors)      |
| POST   | `/api/tutors/search` | TutorDiscovery page (filtered search) |
| GET    | `/api/tutors/:id`    | TutorCard details                     |

### Bookings

| Method | Endpoint                     | Used By                           |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/api/bookings`              | BookingModal (create booking)     |
| GET    | `/api/bookings/:id`          | BookingModal (status polling)     |
| POST   | `/api/bookings/:id/respond`  | BookingFlow (tutor accept/reject) |
| POST   | `/api/bookings/:id/complete` | Mark session complete             |
| GET    | `/api/bookings/student/:id`  | BookingFlow (student view)        |
| GET    | `/api/bookings/tutor/:id`    | BookingFlow (tutor view)          |

### Feedback

| Method | Endpoint                             | Used By                           |
| ------ | ------------------------------------ | --------------------------------- |
| POST   | `/api/feedback`                      | FeedbackForm (submit rating)      |
| GET    | `/api/feedback/outcomes/:student_id` | OutcomeTracker (progress history) |
| GET    | `/api/feedback/tutor/:tutor_id`      | Tutor feedback history            |

### Admin

| Method | Endpoint              | Used By                         |
| ------ | --------------------- | ------------------------------- |
| GET    | `/api/admin/stats`    | AdminDashboard (KPI cards)      |
| GET    | `/api/admin/tutors`   | AdminDashboard (leaderboard)    |
| GET    | `/api/admin/subjects` | AdminDashboard (trends table)   |
| GET    | `/api/admin/alerts`   | AdminDashboard (alerts section) |

---

## 📁 Project Structure

```
project/
├── README.md
├── backend/
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── src/
│       ├── server.js         # Express app entry
│       ├── db/
│       │   ├── pool.js       # PostgreSQL connection
│       │   ├── schema.sql    # Database tables
│       │   └── init.js       # Seed script
│       ├── middleware/
│       │   ├── auth.js       # JWT verification
│       │   └── validation.js # Input validation
│       ├── controllers/      # Business logic
│       └── routes/           # API route definitions
│
└── frontend/
    ├── .env.example          # Environment template
    ├── package.json
    ├── tailwind.config.js    # Tailwind theme config
    ├── postcss.config.js     # PostCSS plugins
    └── src/
        ├── App.jsx           # Main app with routing
        ├── index.css         # Tailwind + component classes
        ├── hooks/            # Data fetching hooks
        ├── components/       # Reusable UI components
        └── pages/            # Page components
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or bun

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** - Copy and edit `.env`:

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

**Frontend** - Copy `.env`:

```bash
cd frontend
cp .env.example .env
```

### 3. Initialize Database

```bash
cd backend
npm run db:init
```

This creates all tables and seeds sample data (3 tutors, 6 users, availability slots).

### 4. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# → http://localhost:3001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### 5. Open Application

Visit **http://localhost:5173** in your browser.

---

## 📦 Build for Production

### Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend

```bash
cd backend
npm start
# Runs without --watch flag
```

---

## 🗃️ Database Schema

| Table                | Description                                       |
| -------------------- | ------------------------------------------------- |
| `users`              | All users (students, tutors, admins)              |
| `tutors`             | Tutor profiles with subjects, rating, hourly rate |
| `tutor_availability` | Available time slots per tutor                    |
| `bookings`           | Session bookings with status workflow             |
| `feedback`           | Post-session ratings and comments                 |
| `learning_outcomes`  | Before/after skill level tracking                 |

---

## 👥 Sample Users (after db:init)

| Email             | Role                       |
| ----------------- | -------------------------- |
| student1@test.com | Student                    |
| tutor1@test.com   | Tutor (Dr. Sarah Math)     |
| tutor2@test.com   | Tutor (Prof. Mike Physics) |
| tutor3@test.com   | Tutor (Ms. Emily Chem)     |
| admin@test.com    | Admin                      |

---
