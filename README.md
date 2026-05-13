# F.L.O.W - Flow of Layout Operations & Workflows

## Project Title & Team

**Team Name:** AETHER  
**Team Lead:** Sivahari S  
**Team Members:** Preethikha S, R Kirthana  
**Institution:** Chennai Institute of Technology

---

## Problem Statement

In the semiconductor industry, analog IC layout engineers manage complex multi-stage verification workflows entirely through spreadsheets and email chains. This causes:

- **No real-time visibility** — managers cannot see where each block stands at any moment
- **Effort estimation gaps** — no structured way to estimate or track hours per block
- **Resource conflicts** — engineers get double-assigned with no system to prevent it
- **Approval bottlenecks** — review requests get lost in email threads with no tracking
- **Zero audit trail** — no record of who did what and when across the pipeline

**F.L.O.W (Flow of Layout Operations & Workflows)** replaces this friction with a purpose-built MERN web application that brings structured project management to the analog layout design process — covering block definition, effort estimation, engineer assignment, pipeline tracking, and manager approvals, all in one place.

---

## Application Flow

### New User Journey
1. User visits the app and clicks **Login with Google**
2. Google OAuth authenticates and redirects back to the app
3. If first login:
   - **If email matches ADMIN_EMAIL in .env** → automatically assigned Admin role and redirected to Admin Dashboard
   - **If email doesn't match** → user sees **"Pending Role Assignment"** screen
4. Admin logs in, sees pending users, and assigns roles (Manager or Engineer)
5. Once role is assigned, user can log back in with full role-based access

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

## Tech Stack Used

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
- **Concurrently v8.2.2** - Run multiple commands simultaneously

---

## UI Screenshots

> **Note:** Screenshots will be added here for the following pages:
> 1. Login Page (Google OAuth)
>    <img width="1600" height="819" alt="image" src="https://github.com/user-attachments/assets/d0037885-c78e-4ad5-91bf-dadcacf3b204" />

> 3. Admin Dashboard
> 4. Manager Dashboard
> 5. Engineer Dashboard
> 6. Block Definition Page
> 7. Workflow Kanban Board
> 8. Assignment Management
> 9. Approval Screen
> 10. Effort Tracking Page
> 11. Dependency Graph (Add-on)

---

## Setup Instructions

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

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This will install dependencies for both server and client.

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
   - The user with email matching `ADMIN_EMAIL` in `.env` will automatically receive Admin role on first login
   - Other users will see "Pending Role Assignment" and need role assignment from Admin

---

## Environment Variables

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

## Features Implemented

### 6 Mandatory Modules

#### 1. Block Definition
- Admin and Manager can create, edit, and manage analog layout blocks
- Each block stores: Name, Type, Description, Estimated Area, Technology Node, and Status
- Engineers can view only their assigned blocks
- Supported block types: Inverter, Current Mirror, Diff Pair, Bandgap, OTA

#### 2. Effort Estimation
- Complexity-based hour estimation using `base_hours × complexity_factor`
- Four complexity levels: Simple (1x) / Medium (1.5x) / Complex (2.5x) / Critical (4x)
- Smart effort prediction — system learns from past blocks of the same type, 
  tech node, and complexity to refine future estimates automatically
- Prediction insights displayed to manager before confirming a new block — 
  shows how similar past blocks actually performed vs their estimates
- Actual hours auto-tracked via stage transition timestamps — no manual 
  input required from engineers
- Admin can override actual hours when timestamps are inaccurate, 
  with the override logged in the audit trail
- Total estimated vs actual hours aggregated on the dashboard with 
  variance highlighting when actuals exceed estimates by more than 20%

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

#### ✅ Dependency Graph Visualization
Interactive visual graph showing all block dependencies built with @xyflow/react. Automatically computes the critical path using longest remaining-work chain (DFS). Critical path nodes and edges highlighted in amber. Managers can add or remove dependencies directly from the graph with built-in cycle detection to prevent circular dependencies.

#### ✅ Dependency Impact Alert
When a block on the critical path is delayed, the system instantly calculates the ripple effect — showing which downstream blocks are affected and total project delay in days.

#### ✅ Bottleneck Detection
Pipeline board highlights stages where blocks are accumulating so managers see congestion points instantly and can reassign engineers accordingly.

#### ✅ Smart Effort Prediction with Insights
System analyses historical block data to predict effort for new blocks. Prediction insights panel shown to manager during block creation — displays how similar blocks (same type, tech node, complexity) performed historically and flags if the current estimate is likely to overrun.

#### ✅ Engineer Assignment Suggestions
When assigning a block, system suggests the most suitable engineer based on current workload, past experience with the same block type, and whether they are currently blocked waiting on a dependency. Manager sees a ranked suggestion list instead of a plain dropdown.

#### ✅ Actual Hours Auto-tracking with Admin Override
Stage transition timestamps automatically calculate actual time spent per stage and in total — no engineer input needed. Admin can manually override the calculated actual hours when timestamps are inaccurate, with every override logged in the audit trail.

#### ✅ Audit Log Viewer
Full chronological log of every action in the system — block creation, stage transitions, approvals, rejections, overrides — with user ID, action type, and timestamp.

#### ✅ Notification System
In-app notifications for managers when a block hits Review stage and for engineers when their block is approved or rejected with feedback.

#### ✅ Effort Analytics Chart
Visual chart comparing estimated vs actual hours across all blocks with variance indicators and trend lines.

#### ✅ Block History Timeline
Per-block view of every stage transition with timestamps, time spent per stage, and responsible engineer.

#### ✅ Engineer Capacity Indicator
Visual workload bar showing each engineer's current block load before assignment so managers make informed decisions.

#### ✅ Search & Filter
Filter blocks by stage, engineer, technology node, or complexity across all dashboard views.

---

## Known Issues / Limitations

1. **No email notification system** — all notifications are in-app only
2. **Mobile responsiveness** is functional but not fully optimised
3. **No pagination on block lists** — performance may degrade with very large datasets

---

**Built with ❤️ by Team AETHER**
