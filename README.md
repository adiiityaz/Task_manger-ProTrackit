# 🚀 ProTrackIt.in | Team Task Manager

ProTrackIt.in is a high-performance, production-ready Team Task Management application built with a modern full-stack architecture. Designed for speed, security, and premium user experience.

![Dashboard Preview](https://raw.githubusercontent.com/adiiityaz/ProTracker/main/preview.png)

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Motion.js.
- **Backend**: Node.js, Express 5.x (Modern Routing).
- **Database**: Prisma 7.x (ORM) with SQLite (Local) and PostgreSQL (Production support).
- **Security**: JWT Authentication, Bcryptjs, Role-Based Access Control (RBAC).
- **UI/UX**: Glassmorphism, Zomato-style inline validation, Premium Dark Mode.

## 🌟 Key Features

- **RBAC (Role-Based Access Control)**:
  - **ADMIN**: Create projects, manage team tasks, and oversee workspace.
  - **MEMBER**: Sign up, view projects, and update task status.
- **Modern SPA Architecture**: Fully integrated frontend and backend on a single port for seamless deployment.
- **Prisma 7 Ready**: Implements the latest mandatory Driver Adapter patterns (`better-sqlite3`).
- **Express 5 Optimized**: Robust routing with modern path-matching logic.
- **Glassmorphism UI**: A stunning, premium dark-themed interface with smooth micro-animations.

## 🚀 Getting Started

### 1. Installation
```bash
npm install
npm run build:frontend
```

### 2. Environment Setup
Create a `.env` file in the root:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_premium_secret_key"
NODE_ENV="production"
```

### 3. Database Initialization
```bash
npx prisma db push
npm run seed
```

### 4. Launch
```bash
npm start
```
Your app will be live at `http://localhost:3000`.

## 🔑 Default Admin Account
- **Email**: `admin@protrackit.in`
- **Password**: `admin123`
*(Members can sign up directly via the UI)*

## 🛡️ Audit Status
- [x] JWT Authentication
- [x] Prisma 7 Migration
- [x] Express 5 Path Fixes
- [x] RBAC Enforcement
- [x] Zomato-style Validation
