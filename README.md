# F.L.O.W - Flow of Layout Operations & Workflows

## 🏆 Project Title & Team

**Team Name:** AETHER  
**Team Lead:** Sivahari S  
**Team Members:** Preethikha S, R Kirthana  
**Institution:** Chennai Institute of Technology

---

## 📋 Problem Statement

In the semiconductor industry, analog IC layout engineers manage complex multi-stage verification workflows entirely through spreadsheets and email chains. This causes:

- **No real-time visibility** — managers cannot see where each block stands at any moment
- **Effort estimation gaps** — no structured way to estimate or track hours per block
- **Resource conflicts** — engineers get double-assigned with no system to prevent it
- **Approval bottlenecks** — review requests get lost in email threads with no tracking
- **Zero audit trail** — no record of who did what and when across the pipeline

**F.L.O.W (Flow of Layout Operations & Workflows)** replaces this friction with a purpose-built MERN web application that brings structured project management to the analog layout design process — covering block definition, effort estimation, engineer assignment, pipeline tracking, and manager approvals, all in one place.

---

## 🔄 Application Flow

### New User Journey
1. User visits the app and clicks **Login with Google**
2. Google OAuth authenticates and redirects back to the app
3. If first login — user sees a **"Pending Role Assignment"** screen
4. Admin logs in, sees the pending user, and assigns a role
5. User refreshes/logs back in and now has full role-based access

### Admin Flow
1. Login via Google OAuth
2. Land on **Admin Dashboard** — see system overview and pending users
3. Assign roles to new users from the pending list
4. Create and manage layout blocks
5. View full audit log of all system actions
6. Monitor all blocks, stages, and engineer assignments

### Manager Flow
1. Login via Google OAuth
2. Land on **Manager Dashboard** — see total blocks, stage breakdown, pending approvals
3. Create new layout blocks with complexity and effort estimation
4. Assign engineers to blocks — system warns if engineer is at capacity
5. Monitor pipeline — see which blocks are stuck or unassigned
6. Receive notification when engineer submits block for Review
7. Open the block, review it, and **Approve** or **Reject** with a comment
8. Track estimated vs actual hours across the project

### Engineer Flow
1. Login via Google OAuth
2. Land on **Engineer Dashboard** — see only assigned blocks
3. Click into a block and advance its stage step by step
4. Log actual hours spent at each stage
5. When ready, advance to **Review** stage — manager gets notified
6. If rejected — see manager's comment, fix the issues, and re-advance through pipeline
7. If approved — block moves to **Completed**, visible on dashboard

---

## 🛠️ Tech Stack Used

### Frontend
- **React v18.3.1** - UI library
- **React Router DOM v6.30.1** - Client-side routing
- **Vite v5.4.19** - Build tool and dev server
- **@xyflow/react v12.10.2** - Dependency graph visualization
- **Recharts v2.15.4** - Data visualization and charts
- **Lucide React v0.462.0** - Icon library
- **Socket.IO Client v4.8.3** - Real-time communication

### Backend
- **Node.js v20** - Runtime environment
- **Express.js v4.18.2** - Web framework
- **MongoDB with Mongoose v7.5.0** - Database and ODM
- **Passport.js v0.6.0** - Authentication middleware
- **Passport Google OAuth 2.0 v2.0.0** - Google authentication strategy
- **Socket.IO v4.8.3** - Real-time bidirectional communication
- **Express Session v1.17.3** - Session management
- **CORS v2.8.5** - Cross-origin resource sharing
- **dotenv v16.6.1** - Environment variable management

### Development Tools
- **Nodemon v3.0.1** - Auto-restart server during development
- **@vitejs/plugin-react-swc** - Fast React refresh with SWC

---

## 📸 UI Screenshots

> **Note:** Screenshots will be added here for the following pages:
> 1. Login Page (Google OAuth)
> 2. Admin Dashboard
> 3. Manager Dashboard
> 4. Engineer Dashboard
> 5. Block Definition Page
> 6. Workflow Kanban Board
> 7. Assignment Management
> 8. Approval Screen
> 9. Effort Tracking Page
> 10. Dependency Graph (Add-on)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v20 or higher
- MongoDB instance (local or cloud)
- Google OAuth 2.0 credentials

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd F.L.O.W
   ```

2. **Install all dependencies (frontend + backend)**
   ```bash
   npm install
   ```
   This will automatically install dependencies for both client and server using npm workspaces.

3. **Configure environment variables**
   - Copy `.env.example` to `.env` in the root directory
   ```bash
   copy .env.example .env
   ```
   - Fill in all required values (see Environment Variables section below)

4. **Set up Google OAuth 2.0**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Copy Client ID and Client Secret to `.env` file

5. **Start the application**
   ```bash
   npm start
   ```
   This will start both the backend server (port 5000) and frontend dev server (port 8080) simultaneously.

6. **Access the application**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:5000`

7. **First-time setup**
   - Login with Google using the admin email specified in `.env`
   - The first user with the admin email will automatically get Admin role
   - Other users will need role assignment from Admin

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://username:password@host:port/database?ssl=true&replicaSet=replica-set-name&authSource=admin&appName=flow-cluster

# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth Callback URLs
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:8080

# Session Secret (Generate a random string for production)
SESSION_SECRET=your-super-secret-session-key

# Admin Configuration
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_ROLE=ADMIN
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Never commit the `.env` file to version control
- For MongoDB, you can use MongoDB Atlas (cloud) or local MongoDB instance
- Generate a strong random string for `SESSION_SECRET`
- The `ADMIN_EMAIL` will automatically receive Admin role on first login

---

## ✅ Features Implemented

### 6 Mandatory Modules

#### 1. Block Definition
- Admin and Manager can create, edit, and manage analog layout blocks
- Each block stores: Name, Type, Description, Estimated Area, Technology Node, and Status
- Engineers can view only their assigned blocks
- Supported block types: Inverter, Current Mirror, Diff Pair, Bandgap, OTA

#### 2. Effort Estimation
- Complexity-based hour estimation using `base_hours × complexity_factor`
- Four complexity levels: Simple / Medium / Complex / Critical
- Managers can manually override auto-calculated estimates
- Total project effort aggregated and displayed on the dashboard

#### 3. Resource Assignment
- Managers assign engineers to blocks from a list of available users
- System automatically prevents double-assignment when engineer is at full capacity
- Full assignment history tracked per block
- Unassigned blocks are flagged prominently on the dashboard

#### 4. Workflow Tracking
- Strict six-stage pipeline: **Not Started → In Progress → DRC → LVS → Review → Completed**
- Only the assigned engineer can advance their block's stage
- Every stage transition is automatically timestamped
- Visual Kanban board / colour-coded status table for real-time pipeline view

#### 5. Approval System
- Engineer submits block for Review → Manager gets notified instantly
- Manager approves (moves to Completed) or rejects (returns to In Progress with comment)
- Rejection feedback visible to the engineer on their dashboard
- All approval and rejection actions logged with timestamp and user ID

#### 6. Dashboard
- **Manager view:** total blocks, blocks by stage, estimated vs actual hours, pending approvals, unassigned blocks — all updating without full page reload
- **Engineer view:** assigned blocks, current stages, hours logged, rejection feedback — live updates without reload
- **Admin view:** full system overview, pending role assignments, audit logs

---

### 🎯 Add-ons & Additional Features

#### ✅ Notification System
In-app notifications for managers when a block hits Review stage and for engineers when their block is rejected

#### ✅ Effort Analytics Chart
Visual chart comparing estimated vs actual hours across all blocks using Recharts

#### ✅ Block History Timeline
Per-block view of every stage transition with timestamps and responsible engineer (WorkflowLog)

#### ✅ Engineer Capacity Indicator
Visual indicator showing each engineer's current workload before assignment

#### ✅ Search & Filter
Search blocks by name/type and filter by stage, technology node, or complexity level

#### ✅ Role-based Route Protection
All routes protected; unauthorized access redirected automatically

#### ✅ Real-time Updates
Socket.IO integration for live dashboard updates without page refresh

#### ✅ Dependency Graph Visualization
Visual representation of block dependencies with critical path highlighting using @xyflow/react

---

## ⚠️ Known Issues / Limitations

1. **No email notification system** — all notifications are in-app only
2. **Mobile responsiveness** is functional but not fully optimised
3. **No pagination on block lists** — performance may degrade with very large datasets

---

## 📁 Project Structure

```
F.L.O.W/
├── client/                 # React frontend
│   ├── src/
│   │   ├── features/      # Feature-based modules
│   │   │   ├── auth/      # Authentication
│   │   │   ├── dashboard/ # Role-based dashboards
│   │   │   ├── blocks/    # Block management
│   │   │   ├── workflow/  # Workflow tracking
│   │   │   ├── assignments/ # Resource assignment
│   │   │   ├── effort/    # Effort tracking
│   │   │   └── approvals/ # Approval system
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── server.js         # Entry point
│   └── package.json
├── .env.example          # Environment template
├── start-flow.bat        # Windows startup script
└── README.md             # This file
```

---

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack MERN application development
- OAuth 2.0 authentication implementation
- Real-time communication with Socket.IO
- Role-based access control (RBAC)
- Complex state management in React
- RESTful API design
- MongoDB schema design and relationships
- Real-world project management workflow automation

---

## 👥 Team Contributions

**Sivahari S (Team Lead)**
- Project architecture and system design
- Backend API development
- Database schema design
- OAuth integration

**Preethikha S**
- Frontend component development
- Dashboard and analytics features
- UI/UX implementation
- Real-time notification system

**R Kirthana**
- Workflow management features
- Approval system implementation
- Testing and bug fixes
- Documentation

---

## 📝 License

This project was developed for the EPIC Build-A-Thon Round 1.

---

## 🙏 Acknowledgments

- Chennai Institute of Technology for support and resources
- EPIC Build-A-Thon organizers for the opportunity
- Semiconductor industry professionals for domain insights

---

## 📞 Contact

For any queries regarding this project, please contact:
- **Team Lead:** Sivahari S
- **Institution:** Chennai Institute of Technology
- **Team:** AETHER

---

**Built with ❤️ by Team AETHER**
