# ProTrackIt - Team Task Manager (Full-Stack)
![ProTrackIt Logo](ProTracker/public/logo.png)

A modern, full-stack task management application with role-based access control, project tracking, and dashboard analytics.

## 🚀 Live Demo
**Live URL:** [Insert Railway URL Here]
**Demo Video:** [Insert Demo Video Link Here]

## ✨ Features
- **Authentication:** Secure Signup/Login with JWT.
- **Role-Based Access Control:** 
  - **Admin:** Full control over projects and task creation.
  - **Member:** Can view projects, tasks, and update the status of tasks assigned to them.
- **Project Management:** Create and manage high-level development initiatives.
- **Task Management:** Create tasks, assign them to team members, set priorities, and track deadlines.
- **Dashboard Overview:** Real-time stats, status distribution, and priority breakdown.
- **Responsive Design:** Premium dark-themed UI built with React, TailwindCSS, and Lucide icons.

## 🔑 Seeder Credentials
- **Admin:** `admin@protrackit.in` / `admin123`
- **Members:** Sign up via the frontend (automatically assigned the `MEMBER` role). Example: `member@protrackit.in`.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, TailwindCSS, Recharts, Framer Motion.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL (Production) / SQLite (Local) with Prisma ORM.
- **Deployment:** Railway.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ProTrack
```

### 2. Backend Setup
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-secret-key"
```

Install dependencies and generate Prisma client:
```bash
npm install
npx prisma generate
```

### 3. Frontend Setup
The frontend is located in the `ProTracker` directory.
```bash
cd ProTracker
npm install
```

### 4. Running the App
**Development Mode:**
```bash
# In the root directory
npm run dev
```

**Production Build:**
```bash
# In the root directory
npm run build
npm start
```

## 📝 Assignment Requirements (A-Z Done)
- [x] REST APIs + Database
- [x] Proper validations & relationships
- [x] Role-based access control (Admin/Member)
- [x] Dashboard (tasks, status, overdue)
- [x] Deploy using Railway
- [x] README & Video

---
*Created for the Team Task Manager Assignment.*
