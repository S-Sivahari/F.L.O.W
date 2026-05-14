# F.L.O.W Technical Overview

## 1. System Architecture

F.L.O.W is a MERN-based workflow management application split into two independently run parts:

- **Frontend**: React + Vite application in `client/`
- **Backend**: Express + MongoDB application in `server/`

The root `package.json` uses `concurrently` to run both sides together during development. The frontend talks to the backend over HTTP using JSON APIs, and authentication is handled with a session cookie rather than a token stored in the browser.

## 2. Frontend Architecture

### Entry points

- `client/src/main.jsx` boots the React app.
- `client/src/App.jsx` wires global providers and the router.
- `client/src/router/AppRouter.jsx` defines all route-level navigation.

### Core frontend layers

- **Pages**: route-level containers such as Login, Pending, Dashboard, Blocks, Effort, Workflow, Assignments, and Approvals.
- **Components**: reusable UI pieces like tables, dialogs, sidebars, topbars, loaders, kanban columns, and notification UI.
- **Services**: API wrappers under `client/src/services/` that isolate network calls from UI components.
- **Shared utilities**: auth context, role guards, constants, and helper functions.

### Frontend routing and access control

The router protects pages through a `Protected` wrapper. It checks:

- whether a user is authenticated
- whether the user is still in `PENDING` role state
- whether the current role can perform the requested action

Access rules are centralized in `client/src/shared/utils/roleGuard.js`. That means the UI does not only hide pages visually; it also blocks navigation to unauthorized modules.

### Frontend auth module

The frontend auth flow is intentionally simple:

- `client/src/features/auth/pages/LoginPage.jsx` renders the Google login screen
- `client/src/features/auth/components/GoogleSignInButton.jsx` triggers the login action
- `client/src/services/auth.service.js` redirects the browser to the backend OAuth endpoint
- `client/src/shared/context/AuthContext.jsx` loads the current session on app startup by calling `/api/auth/me`

The frontend does not implement Google OAuth directly. It only starts the login redirect and then reads the authenticated session after the backend completes the callback.

## 3. Backend Architecture

### Entry point

- `server/server.js` is the backend bootstrap file.

### Backend middleware stack

The server configures:

- `express.json()` and `express.urlencoded()` for request parsing
- `cors()` with `CLIENT_URL` so the browser app can call the API with credentials
- `express-session` for session persistence
- `passport.initialize()` and `passport.session()` for authentication state

### API route modules

The backend is modularized by domain:

- `server/routes/auth.js` for Google login, current user lookup, logout, and login attempt history
- `server/routes/blocks.js` for block management
- `server/routes/assignments.js` for engineer assignment workflows
- `server/routes/approvals.js` for review and approval actions
- `server/routes/effort.js` for effort tracking and overrides
- `server/routes/users.js` for user records and role-based user operations
- `server/routes/workflow-logs.js` for audit logs and timeline history
- `server/routes/notifications.js` for notifications
- `server/routes/admin.js` for admin-only operations

### Data layer

The backend uses MongoDB through Mongoose models in `server/models/`:

- `User.js`
- `Block.js`
- `Assignment.js`
- `Approval.js`
- `Effort.js`
- `Notification.js`
- `WorkflowLog.js`
- `LoginAttempt.js`

That model layer stores the persistent workflow state, audit trail, login activity, and role assignments.

## 4. Google Auth and Passport.js

### What Passport.js does here

`server/config/passport.js` is the authentication core. It defines:

- the Google OAuth strategy
- user lookup and provisioning logic
- session serialization and deserialization

Passport is not used as a local username/password system. It is used only to broker Google sign-in and convert the Google identity into an application user stored in MongoDB.

### Google OAuth strategy

The Google strategy uses these environment variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

When the user signs in, Google returns profile data to the callback route. The backend extracts the Google email, checks whether the account is allowed, and then either creates or updates the corresponding MongoDB user.

### User provisioning logic

The passport strategy has three main cases:

- **Hardcoded admin account**: if the email matches `ADMIN_EMAIL`, the user is created or updated with the configured admin role.
- **First-time non-admin login**: the user is created with `PENDING` role and routed to a waiting screen.
- **Existing user**: the backend updates Google metadata such as `googleId` and avatar, then keeps the stored role.

The backend also records login activity in `LoginAttempt` and sends notifications when a pending user is created.

### Session handling

Passport serializes the MongoDB user ID into the session and deserializes it on later requests. That is why the frontend can refresh the page and still remain logged in as long as the session cookie is valid.

## 5. Auth Flow End to End

1. The user clicks **Sign in with Google** on the frontend.
2. The browser is redirected to `GET /api/auth/google`.
3. Passport sends the user through Google OAuth.
4. Google redirects back to `GET /api/auth/google/callback`.
5. The backend creates, updates, or blocks the user based on email and role rules.
6. The backend stores the user in the Express session.
7. The frontend loads `/api/auth/me` on startup to restore the current user.
8. If the user is `PENDING`, the backend redirects them to `/pending`.
9. If the user is authorized, the backend redirects them to `/dashboard`.

## 6. Role Model

The application uses role-based access control around three main roles:

- **ADMIN**
- **MANAGER**
- **ENGINEER**

The frontend role guard and backend authorization logic work together so the same permissions are enforced in both places. The UI prevents navigation to restricted pages, and the backend controls the actual data mutations.

## 7. Frontend Feature Modules

### Dashboard

Provides role-specific summaries, metrics, and workflow visibility.

### Blocks

Handles block creation, editing, details, and status management.

### Assignments

Manages engineer allocation, capacity checks, and unassigned block handling.

### Effort

Tracks estimated hours, actual hours, and variance.

### Workflow

Provides kanban-style pipeline views, dependency graphs, and workflow logs.

### Approvals

Supports submit-for-review, approve, reject, and comment workflows.

### Auth

Handles Google sign-in and pending-user registration flow.

## 8. Shared Frontend Infrastructure

The `client/src/shared/` directory contains cross-cutting infrastructure:

- `context/` for auth state
- `hooks/` for reusable state access patterns
- `utils/` for permission checks and API helpers
- `components/` for shared UI primitives
- `constants/` for role and app constants

This keeps business pages thin and avoids repeating auth, permissions, and loading-state logic in every screen.

## 9. Environment Configuration

The backend reads `.env` from the project root. Important variables include:

- `MONGODB_URI`
- `CLIENT_URL`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `ADMIN_EMAIL`
- `ADMIN_ROLE`

If the Google variables are missing, `/api/auth/google` is intentionally treated as unavailable. If `MONGODB_URI` is missing, the server still starts but DB-backed routes will fail.

## 10. Short Technical Summary

F.L.O.W is a session-based React/Express application where the frontend handles routing and UX, the backend owns authentication and persistence, Passport.js brokers Google OAuth, and MongoDB stores users, blocks, assignments, approvals, effort data, notifications, and audit logs. The design keeps auth logic centralized on the server while exposing a simple session check to the client.

## 11. File-by-File Module Map

### Frontend entry and routing

- `client/src/main.jsx` mounts the React application.
- `client/src/App.jsx` wraps the app with shared providers and the router.
- `client/src/router/AppRouter.jsx` defines all routes and guards access by role.

### Frontend auth module

- `client/src/features/auth/pages/LoginPage.jsx` renders the Google login screen.
- `client/src/features/auth/components/GoogleSignInButton.jsx` provides the Google sign-in button UI.
- `client/src/features/auth/components/RegistrationModal.jsx` captures extra profile details when a Google user needs onboarding or role completion.
- `client/src/services/auth.service.js` starts Google OAuth, loads the current session user, and logs the user out.
- `client/src/shared/context/AuthContext.jsx` bootstraps authenticated user state from the backend session.
- `client/src/shared/hooks/useAuth.js` exposes the auth context to pages and components.

### Frontend dashboard module

- `client/src/features/dashboard/pages/DashboardPage.jsx` chooses which dashboard to show based on the signed-in user role.
- `client/src/features/dashboard/components/AdminDashboard.jsx` shows admin controls, pending users, and system-wide status.
- `client/src/features/dashboard/components/ManagerDashboard.jsx` shows manager metrics, assignments, and engineer access controls.
- `client/src/features/dashboard/components/EngineerDashboard.jsx` shows the engineer view of assigned work and progress.
- `client/src/features/dashboard/components/StatCard.jsx` renders summary metric cards.
- `client/src/features/dashboard/components/PendingApprovalsList.jsx` shows approvals that still need manager action.
- `client/src/features/dashboard/components/EffortSummaryChart.jsx` visualizes estimated and actual effort.
- `client/src/features/dashboard/components/BlocksByStageChart.jsx` visualizes block distribution across workflow stages.

### Frontend blocks module

- `client/src/features/blocks/pages/BlocksPage.jsx` is the main blocks management page.
- `client/src/features/blocks/components/BlockTable.jsx` lists blocks in a tabular format.
- `client/src/features/blocks/components/BlockFormModal.jsx` creates and edits block records.
- `client/src/features/blocks/components/BlockDetailDrawer.jsx` shows block details in a side panel.

### Frontend assignments module

- `client/src/features/assignments/pages/AssignmentsPage.jsx` is the assignment management page.
- `client/src/features/assignments/components/AssignModal.jsx` assigns engineers to blocks.
- `client/src/features/assignments/components/AssignmentTable.jsx` shows assignment records.
- `client/src/features/assignments/components/EngineerCapacityBar.jsx` shows how full each engineer is.
- `client/src/features/assignments/components/UnassignedBlocksFlag.jsx` highlights blocks that still need an engineer.

### Frontend effort module

- `client/src/features/effort/pages/EffortPage.jsx` is the main effort tracking page.
- `client/src/features/effort/components/TotalEffortSummary.jsx` summarizes total effort totals and variance.
- `client/src/features/effort/components/EffortTable.jsx` lists effort entries.
- `client/src/features/effort/components/EffortOverrideModal.jsx` lets authorized users override effort values.
- `client/src/features/effort/components/EffortLogModal.jsx` shows effort history for a block.

### Frontend approvals module

- `client/src/features/approvals/pages/ApprovalsPage.jsx` is the approvals workflow page.
- `client/src/features/approvals/components/ApprovalQueue.jsx` lists blocks waiting for review.
- `client/src/features/approvals/components/ApproveRejectPanel.jsx` provides approve and reject actions.
- `client/src/features/approvals/components/RejectionFeedback.jsx` displays rejection comments and follow-up notes.

### Frontend workflow module

- `client/src/features/workflow/pages/WorkflowPage.jsx` is the main workflow board page.
- `client/src/features/workflow/pages/DependencyGraphPage.jsx` shows dependency relationships between blocks.
- `client/src/features/workflow/components/KanbanBoard.jsx` renders the kanban-style pipeline view.
- `client/src/features/workflow/components/BlockCard.jsx` renders a single workflow block card.
- `client/src/features/workflow/components/WorkflowLogDrawer.jsx` shows the workflow audit log for a block.
- `client/src/features/workflow/components/NodeDetailsDrawer.jsx` shows dependency node details.
- `client/src/features/workflow/components/DependencyModal.jsx` handles dependency creation and editing.
- `client/src/features/workflow/components/DependencyGraph.jsx` renders the dependency graph visualization.

### Frontend shared UI

- `client/src/shared/components/Topbar.jsx` renders the top navigation and user controls.
- `client/src/shared/components/Sidebar.jsx` renders the side navigation.
- `client/src/shared/components/PageWrapper.jsx` provides the common page layout shell.
- `client/src/shared/components/NotificationBell.jsx` shows in-app notifications.
- `client/src/shared/components/Toast.jsx` shows transient success and error messages.
- `client/src/shared/components/StatusBadge.jsx` renders status labels.
- `client/src/shared/components/Modal.jsx` is the shared modal shell.
- `client/src/shared/components/LoadingSpinner.jsx` renders loading states.
- `client/src/shared/components/KanbanColumn.jsx` renders a kanban column container.
- `client/src/shared/components/EmptyState.jsx` renders empty-state UI.
- `client/src/shared/components/DataTable.jsx` provides reusable table rendering.
- `client/src/shared/components/ConfirmDialog.jsx` provides a reusable confirmation dialog.

### Frontend shared state and helpers

- `client/src/shared/context/AuthContext.jsx` stores the current authenticated user.
- `client/src/shared/context/ToastContext.jsx` manages app-wide toast messages.
- `client/src/shared/utils/api.js` wraps fetch calls, carries the session cookie, and emits data-change events.
- `client/src/shared/utils/roleGuard.js` defines which roles can perform which actions.
- `client/src/shared/constants/roles.js` stores the role names used across the app.

### Frontend API service layer

- `client/src/services/api.js` is the low-level API helper used by every service.
- `client/src/services/admin.service.js` handles admin operations such as user enablement and system actions.
- `client/src/services/approvals.service.js` calls approval-related backend endpoints.
- `client/src/services/assignments.service.js` calls assignment-related backend endpoints.
- `client/src/services/auth.service.js` handles Google login, session lookup, and logout.
- `client/src/services/blocks.service.js` calls block CRUD endpoints.
- `client/src/services/dependencies.service.js` calls dependency graph endpoints.
- `client/src/services/effort.service.js` calls effort tracking endpoints.
- `client/src/services/notifications.service.js` loads and updates notifications.
- `client/src/services/users.service.js` loads and updates user records.
- `client/src/services/workflow.service.js` calls workflow transition and log endpoints.

### Backend bootstrap and configuration

- `server/server.js` starts the Express server, registers middleware, mounts routes, and connects the app together.
- `server/config/database.js` connects Mongoose to MongoDB and exposes the database connection helpers.
- `server/config/passport.js` defines Google OAuth, user provisioning, and Passport session behavior.
- `server/middleware/auth.js` provides backend authentication and role-guard middleware.

### Backend services and utilities

- `server/services/notificationService.js` creates notifications for pending users, assignments, approvals, and workflow events.
- `server/services/cleanupService.js` removes old completed blocks and their related records.
- `server/utils/jwt.js` provides token generation and verification helpers.
- `server/utils/seed.js` creates sample users for development or initial setup.

### Backend routes

- `server/routes/auth.js` handles Google login, callback handling, current-user lookup, logout, and login attempt history.
- `server/routes/admin.js` exposes admin-only operations.
- `server/routes/blocks.js` handles block CRUD and block lifecycle operations.
- `server/routes/assignments.js` handles engineer assignment operations.
- `server/routes/approvals.js` handles approve and reject actions.
- `server/routes/effort.js` handles effort entry and override actions.
- `server/routes/users.js` handles user and role management.
- `server/routes/workflow-logs.js` exposes workflow audit history.
- `server/routes/notifications.js` exposes notification data and updates.

### Backend data models

- `server/models/User.js` stores user identity, role, Google profile linkage, and active state.
- `server/models/Block.js` stores block metadata, stage, and workflow status.
- `server/models/Assignment.js` stores which engineer is assigned to which block.
- `server/models/Approval.js` stores review decisions and comments.
- `server/models/Effort.js` stores estimated and actual effort values.
- `server/models/Notification.js` stores in-app notifications for users.
- `server/models/WorkflowLog.js` stores workflow history and stage changes.
- `server/models/LoginAttempt.js` stores Google auth attempts and audit information.
