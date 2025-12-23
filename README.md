# Real-Time Tutor Booking System

A full-stack web application for connecting students with tutors, featuring real-time booking workflows, live chat, interactive dashboards, and admin analytics.

---

## 📋 Project Overview

This platform enables students to discover tutors based on subject expertise, budget, and availability. Tutors can accept or decline booking requests in real-time, and students can provide feedback after sessions to track their learning progress.

### Key Features

- **Tutor Discovery** - Search and filter tutors by subject, budget, and availability with a smart matching algorithm.
- **Real-Time Booking** - State machine workflow: Requested → Accepted/Rejected → Completed.
- **Real-Time Notifications** - Instant alerts for booking updates and messages using Socket.io.
- **Live Chat** - Integrated messaging system for students and tutors to coordinate sessions.
- **Feedback System** - Star ratings, comments, and learning outcome tracking.
- **Role-Based Dashboards** - Dedicated interfaces for Students, Tutors, and Admins.
- **Admin Dashboard** - Platform analytics, tutor effectiveness metrics, and user management.

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
│                           HTTP/REST API & Socket.io               │
│                                    │                              │
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
│                            Mongoose ODM                           │
│                                    │                              │
└────────────────────────────────────┬─────────────────────────────┘
                                     │
┌────────────────────────────────────┴─────────────────────────────┐
│                        DATABASE (MongoDB)                         │
├──────────────────────────────────────────────────────────────────┤
│  Collections: users, bookings, reviews, messages                  │
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
| Socket.io Client| Real-time communication  |

### Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Node.js    | Runtime environment   |
| Express.js | REST API framework    |
| MongoDB    | NoSQL Database        |
| Mongoose   | ODM for MongoDB       |
| Socket.io  | Real-time event server|
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
| PUT    | `/api/bookings/:id`          | BookingFlow (tutor accept/reject) |
| GET    | `/api/bookings/student`      | BookingFlow (student view)        |
| GET    | `/api/bookings/tutor`        | BookingFlow (tutor view)          |

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
│       │   └── init.js       # Seed script for MongoDB
│       ├── middleware/
│       │   ├── auth.js       # JWT verification
│       │   └── validation.js # Input validation
│       ├── models/           # Mongoose Models (User, Booking, etc.)
│       ├── controllers/      # Business logic
│       └── routes/           # API route definitions
│
└── frontend/
    ├── .env.example          # Environment template
    ├── package.json
    ├── tailwind.config.js    # Tailwind theme config
    └── src/
        ├── App.jsx           # Main app with routing
        ├── context/          # Auth & Socket Context
        ├── components/       # Reusable UI components
        └── pages/            # Page components
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (running locally on port 27017 or Atlas URI)
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
# Edit .env with your MongoDB credentials (default is localhost:27017)
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

This commands connects to MongoDB and seeds sample data (users, bookings, requests).

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

## 🗃️ Database Schema (MongoDB)

| Collection | Description                                       |
| ---------- | ------------------------------------------------- |
| `users`    | All users (Student, Tutor, Admin) with role field |
| `bookings` | Session bookings with status tracking             |
| `reviews`  | Post-session ratings and comments                 |
| `messages` | Chat messages between users                       |

---

## 👥 Sample Users (after db:init)

| Email             | Role                       | Password |
| ----------------- | -------------------------- | -------- |
| student1@test.com | Student                    | password123 |
| tutor1@test.com   | Tutor (Dr. Sarah Math)     | password123 |
| admin@test.com    | Admin                      | password123 |

---
