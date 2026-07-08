# 🎓 CampusOS AI v2.0 — Enterprise Edition

**CampusOS, made by Jai Samyukth Enterprises**

An AI-Native Campus Operating System with multi-agent architecture, unifying all campus services into a single intelligent OS. Built with Next.js 16, React 19, TypeScript, and a glassmorphism dark/light mode UI.

---

## 🚀 Quick Start (How to Run)

### Prerequisites

- **Node.js** >= 18.x
- **Bun** >= 1.x (recommended) or npm/yarn
- **Git**

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd my-project
```

### Step 2: Install Dependencies

```bash
bun install
# OR
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the project root (one may already exist):

```env
DATABASE_URL=file:./db/custom.db
GEMINI_API_KEY=your-key-here
CAMPUOS_HMAC_SECRET=campusos-ai-hmac-secret-2025-jse
NEXTAUTH_SECRET=campusos-v2-secret-key-2024
```

**Get your FREE Gemini API key at:** https://aistudio.google.com/apikey

### Step 4: Initialize the Database

```bash
# Push the Prisma schema to create the SQLite database
bun run db:push

# Generate the Prisma client
bun run db:generate
```

### Step 5: Add Your Gemini API Key

Edit the `.env` file and paste your Gemini API key:
```
GEMINI_API_KEY=AIzaSyB...your-key-here
```

Get a **FREE** key at https://aistudio.google.com/apikey — no credit card needed.
Free tier: 15 requests/minute, 1,500 requests/day.

> The app works without the API key (all dashboards, charts, data), but **AI chat won't respond** without it.

### Step 6: Seed the Database (CRITICAL — Creates Admin Account & Demo Data)

```bash
# Seed the main database (admin, students, faculty, subjects, etc.)
bunx tsx prisma/seed.ts
```

This creates:
- **Admin account**: `admin@JSE.com` with password `Samyukth@2378`
- Demo students, faculty, subjects, attendance records, and more

### Step 7: Start the Development Server

```bash
bun run dev
# OR
npm run dev
```

The app will be running at **http://localhost:3000**

### Step 8: Log In

Open your browser and go to `http://localhost:3000`. You'll see the login page.

**Default Admin Credentials:**
| Field     | Value              |
|-----------|--------------------|
| Email     | `admin@JSE.com`   |
| Password  | `Samyukth@2378`   |

---

## 🏗️ Project Structure

```
my-project/
├── prisma/
│   ├── schema.prisma          # Database schema (17+ models)
│   ├── seed.ts                # Main seed data
│   ├── seed-admin.ts          # Admin + extended seed data
│   └── seed-auth.ts           # Auth-specific seeding
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main app (post-login dashboard)
│   │   ├── login/page.tsx     # Login page
│   │   ├── layout.tsx         # Root layout with ThemeProvider
│   │   ├── globals.css        # Global styles + custom animations
│   │   └── api/               # API routes (see below)
│   ├── components/
│   │   ├── campus/            # Core app components
│   │   ├── auth/              # Authentication components
│   │   └── ui/                # shadcn/ui component library
│   ├── hooks/                 # Custom React hooks
│   └── lib/
│       ├── store.ts           # Zustand state management
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client instance
│       └── utils.ts           # Utility functions
├── db/
│   └── custom.db              # SQLite database file
├── public/                    # Static assets
├── middleware.ts              # Auth middleware (route protection)
└── package.json               # Dependencies & scripts
```

---

## 🧩 API Routes

### Authentication
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | `/api/auth/login`             | Login with email/password|
| POST   | `/api/auth/register`          | Register (admin creates) |
| GET    | `/api/auth/session-info`      | Get current session info  |
| GET    | `/api/auth/users`             | List all users (admin)    |

### Student Data
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/api/dashboard`              | Dashboard stats          |
| GET    | `/api/attendance`             | Attendance records       |
| GET    | `/api/academic`               | Academic data            |
| GET    | `/api/exams`                  | Exam schedule & results  |
| GET    | `/api/placement`              | Placement data           |
| GET    | `/api/library`                | Library books & loans    |
| GET    | `/api/hostel`                 | Hostel info              |
| GET    | `/api/finance`                | Fee & payment data       |
| GET    | `/api/events`                 | Campus events            |
| GET    | `/api/notifications`          | User notifications       |
| GET    | `/api/profile`                | User profile             |
| GET    | `/api/ai-memory`              | AI memory & context      |
| POST   | `/api/chat`                   | AI chat (LLM-powered)   |

### Faculty
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | `/api/faculty`                        | List faculty             |
| GET    | `/api/faculty/[id]`                   | Faculty details          |
| GET    | `/api/faculty/[id]/dashboard`         | Faculty dashboard        |
| GET    | `/api/faculty/[id]/attendance`        | Attendance management    |
| GET    | `/api/faculty/[id]/assignments`       | Assignment management    |
| PATCH  | `/api/faculty/[id]/assignments/[aid]/grade` | Grade assignment  |
| GET    | `/api/faculty/[id]/classes`           | Faculty classes          |

### Admin
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | `/api/admin`                          | Admin dashboard stats    |
| GET    | `/api/admin/students`                 | Student management       |
| PATCH  | `/api/admin/students/[id]`            | Update student           |
| GET    | `/api/admin/faculty`                  | Faculty management       |
| PATCH  | `/api/admin/faculty/[id]`             | Update faculty           |
| GET    | `/api/admin/subjects`                 | Subject management       |
| GET    | `/api/admin/complaints`               | Complaint management     |
| GET    | `/api/admin/search`                   | Smart search             |
| POST   | `/api/admin/notifications/broadcast`  | Broadcast notification   |

---

## 👥 Three-Portal Architecture

CampusOS AI has three distinct portals with role-based access:

### 🎓 Student Portal
- **Dashboard** — GPA, attendance, placement readiness at a glance
- **Attendance** — Per-subject attendance tracking with trends
- **Placement** — Company applications, interview schedules, offer tracking
- **Library** — Book search, borrow/return, digital resources, fines
- **Academic** — Subjects, schedule, faculty info
- **Exams** — Timetable, hall tickets, results, CGPA calculator
- **Hostel** — Room info, complaints, warden details
- **Finance** — Fee breakdown, payment status, due dates
- **Events** — Campus events, registrations, certificates
- **AI Memory** — Context-aware AI recall
- **Workflow** — IF-THEN automation builder
- **Profile** — Personal info, settings

### 👨‍🏫 Faculty Portal
- **Dashboard** — Classes today, pending reviews, quick stats
- **My Classes** — Assigned subjects with enrollment counts
- **Attendance** — Mark & manage student attendance
- **Assignments** — Create, review, grade assignments
- **Students** — Student directory with performance data
- **Schedule** — Weekly timetable view
- **AI Assistant** — Faculty-specific AI chat

### 🛡️ Administrator Portal
- **Dashboard** — Campus-wide analytics & KPIs
- **Students** — Full CRUD student management
- **Faculty** — Full CRUD faculty management
- **Courses** — Subject & curriculum management
- **Complaints** — Resolve & track complaints
- **Notifications** — Broadcast notifications campus-wide
- **Smart Search** — Global search across all entities
- **Knowledge Base** — AI knowledge management
- **Automation** — Workflow automation builder
- **AI Playground** — Test AI agents & prompts
- **User Management** — Create accounts with @JSE.com emails

---

## 🤖 AI Multi-Agent Architecture

CampusOS uses a **Master AI Orchestrator** that routes queries to specialized agents:

```
User Query → Master AI → Routes to:
  ├── Attendance Agent    (attendance tracking, trends, predictions)
  ├── Placement Agent     (company data, interview prep, applications)
  ├── Library Agent       (book search, availability, recommendations)
  ├── Academic Agent      (schedule, syllabus, faculty info)
  ├── Finance Agent       (fee status, payment history, dues)
  ├── Events Agent        (upcoming events, registration, venues)
  └── General Agent       (fallback for all other queries)
```

- **Voice-to-AI**: Speak directly to the AI — voice input is transcribed and sent to the chat
- **Context-Aware Buttons**: Click any contextual button (e.g., "Ask AI about attendance") and it auto-sends a relevant message to the AI with the right agent selected

---

## 🎨 UI Features

- **Glassmorphism Design** — Frosted glass cards, animated gradients, neon glow effects
- **Dark & Light Mode** — Full theme toggle with legible text in both modes
- **Splash Screen** — "CampusOS, made by Jai Samyukth Enterprises" on initial load
- **Responsive** — Mobile-first design, works on all screen sizes
- **Animations** — Framer Motion transitions, hover effects, scroll animations
- **Command Palette** — Ctrl+K for quick navigation
- **Notification Toasts** — Real-time feedback for all actions

---

## 🔐 Security

- **Password Hashing**: bcrypt with 10-12 salt rounds
- **HMAC-Signed Tokens**: Node.js crypto for token signing (SHA-256)
- **Route Protection**: Next.js middleware validates tokens on every request
- **24-Hour Token Expiry**: Tokens automatically expire after 24 hours
- **Rate Limiting**: 5 login attempts per IP in 15 minutes
- **Admin-Only Account Creation**: Only admins can create new user accounts
- **Role-Based Access Control**: Three distinct portals with strict role separation
- **Auto-migration**: Plain-text passwords auto-upgraded to bcrypt on login

> ⚠️ **Before going live**, see `DEPLOYMENT_GUIDE.md` for production security checklist.

---

## 🛠️ Tech Stack

| Category       | Technology                           |
|----------------|--------------------------------------|
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript 5                        |
| UI Library     | React 19                            |
| Styling        | Tailwind CSS 4 + shadcn/ui          |
| State Mgmt     | Zustand                              |
| Database       | SQLite via Prisma ORM               |
| Auth           | Custom HMAC + NextAuth.js v4        |
| AI             | Google Gemini 2.0 Flash (FREE)     |
| Animations     | Framer Motion                        |
| Charts         | Recharts                             |
| Icons          | Lucide React                         |

---

## 📋 Available Scripts

| Command               | Description                                    |
|-----------------------|------------------------------------------------|
| `bun run dev`         | Start development server on port 3000          |
| `bun run build`       | Build for production                           |
| `bun run start`       | Start production server                        |
| `bun run lint`        | Run ESLint to check code quality               |
| `bun run db:push`     | Push Prisma schema to database                 |
| `bun run db:generate` | Generate Prisma client                         |
| `bun run db:migrate`  | Run Prisma migrations                          |
| `bun run db:reset`    | Reset database (WARNING: deletes all data)     |
| `bunx tsx prisma/seed.ts` | Seed database with demo data             |

---

## 📦 Database Schema

The application uses **17+ Prisma models**:

`User` → `Student` → `Attendance`, `SubjectEnrollment`, `Placement`, `Complaint`, `LeaveRequest`, `EventParticipant`, `AssignmentSubmission`, `Fee`, `AiMemory`, `Conversation`, `BookTransaction`, `InternalMark`

`User` → `Faculty` → `Subject` → `Assignment`, `Attendance`, `InternalMark`

`Book` → `BookTransaction`

`Event` → `EventParticipant`

`Notification` (linked to User)

---

## 🔑 Default Login Credentials

| Role    | Email              | Password           |
|---------|--------------------|--------------------|
| Admin   | `admin@JSE.com`   | `Samyukth@2378`   |

> **Note**: All user emails use the `@JSE.com` domain. Only admins can create new accounts.

---

## 🖼️ Screenshots

Screenshots are available in the `download/` folder:
- Dashboard, Attendance, Placement, Library, Academic, Exams, Hostel, Finance, Events
- Admin Portal, Faculty Portal
- AI Chat, Voice Assistant, Command Palette
- Profile, Settings, Notifications

---

## 🏢 About

**CampusOS AI v2.0 — Enterprise Edition**
Made by **Jai Samyukth Enterprises**

---

## 📄 License

Proprietary — All rights reserved by Jai Samyukth Enterprises.
