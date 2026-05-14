# F.L.O.W Presentation Script

## 1. Opening

Good morning everyone. We are Team AETHER, and our project is F.L.O.W, which stands for Flow of Layout Operations & Workflows.

F.L.O.W is a MERN-based workflow management platform designed for analog IC layout teams. It replaces spreadsheet-driven coordination with a structured system for block definition, engineer assignment, effort tracking, workflow monitoring, approvals, and audit logging.

## 2. Problem Statement

In semiconductor layout work, many teams still manage progress through spreadsheets, email chains, and manual follow-ups. That creates several problems:

- no real-time visibility into block status
- no clear effort estimation tracking
- engineers can be assigned to too much work
- approvals get delayed or lost
- there is no strong audit trail for actions

Our application solves this by putting the entire workflow into one web platform.

## 3. What the System Does

The application supports three main roles:

- **Admin**: manages users, access, and system-wide visibility
- **Manager**: creates blocks, assigns engineers, and handles approvals
- **Engineer**: works on assigned blocks and advances them through the workflow stages

The app is role-based, so each user only sees the features that match their permissions.

## 4. Technical Architecture

F.L.O.W is split into two parts:

- **Frontend**: React with Vite in the `client/` folder
- **Backend**: Express, MongoDB, and Passport.js in the `server/` folder

The frontend communicates with the backend using API calls. Authentication is session-based, so once a user signs in through Google, the server stores the session and the frontend restores the logged-in user on refresh.

## 5. Google Authentication Flow

Authentication starts from the login page in the frontend. When the user clicks **Sign in with Google**, the browser is redirected to the backend OAuth route.

The backend uses Passport.js with the Google OAuth 2.0 strategy. After Google returns the user profile, the server checks the email address and decides what to do:

- if the email matches the configured admin email, the user gets admin access
- if it is a new non-admin user, the account is created in `PENDING` state
- if the user already exists, the backend restores their role and session

If the user is pending, they are redirected to a waiting page until an admin assigns a role.

## 6. Main Modules

### Login and Auth

This module handles Google sign-in, session restoration, logout, and pending-user flow.

### Dashboard

This is the main overview screen. It changes based on role and shows metrics, summaries, and workflow status.

### Blocks

This module is used to create and manage layout blocks. A block represents the work item moving through the design pipeline.

### Assignments

This module lets managers assign engineers to blocks and check capacity so the same engineer is not overloaded.

### Effort

This module tracks estimated hours, actual hours, and effort variance.

### Workflow

This module shows the kanban-style pipeline and workflow logs, including stage changes and dependencies.

### Approvals

This module supports review decisions. Managers can approve or reject blocks with comments.

### Notifications and Audit

This module records important system events such as pending users, assignments, approvals, and workflow changes.

## 7. Key Backend Files

- `server/server.js` starts the application, registers middleware, and mounts routes.
- `server/config/passport.js` defines Google OAuth behavior and user provisioning.
- `server/config/database.js` connects the app to MongoDB.
- `server/routes/auth.js` handles login, callback, current user, and logout.
- `server/routes/blocks.js`, `assignments.js`, `approvals.js`, `effort.js`, `users.js`, and `workflow-logs.js` handle business operations.
- `server/models/*.js` store users, blocks, assignments, approvals, effort, notifications, logs, and login attempts.

## 8. Key Frontend Files

- `client/src/router/AppRouter.jsx` controls routing and access rules.
- `client/src/shared/context/AuthContext.jsx` keeps track of the signed-in user.
- `client/src/services/auth.service.js` starts Google login and restores the session.
- `client/src/features/dashboard/pages/DashboardPage.jsx` loads the correct dashboard for the role.
- `client/src/features/workflow/pages/WorkflowPage.jsx` shows the workflow board.
- `client/src/features/assignments/pages/AssignmentsPage.jsx` and `client/src/features/effort/pages/EffortPage.jsx` handle the operational modules.

## 9. Why This Project Is Useful

This system improves visibility, reduces manual coordination, and creates a structured approval pipeline. It also gives managers better control over assignments and effort, while engineers get a clearer view of their tasks and status.

## 10. Closing

In short, F.L.O.W is a workflow management platform that brings structure, traceability, and role-based access control to analog layout operations. It replaces disconnected spreadsheets and email-based tracking with one centralized system.

Thank you.

---

# Presentation Questions and Answers

## 1. What is F.L.O.W?

F.L.O.W is a workflow management web application for analog IC layout operations. It helps teams manage blocks, assignments, effort tracking, approvals, and workflow progress in one place.

## 2. What problem does it solve?

It solves the lack of real-time visibility, manual tracking, assignment conflicts, and approval delays that happen when teams rely on spreadsheets and email.

## 3. What technology stack did you use?

The frontend uses React and Vite. The backend uses Node.js, Express, MongoDB, Passport.js, and express-session. The app also uses Google OAuth for authentication.

## 4. Why did you use Passport.js?

Passport.js is used to manage Google OAuth authentication in a clean and standard way. It also integrates well with Express sessions.

## 5. How does Google login work in your project?

The frontend redirects the user to the backend Google OAuth route. Passport authenticates with Google, the backend checks the email and role, and then stores the authenticated user in the session.

## 6. Why did you choose session-based authentication instead of JWT for login?
 
Session-based auth is simpler for browser login flows and works naturally with Passport.js. The session cookie lets the frontend restore the user state after refresh.

## 7. What happens when a user logs in for the first time?

If the user is not the admin account, the backend creates the user with a `PENDING` role. That user is redirected to a waiting page until an admin assigns a role.

## 8. What are the main roles in the system?

The main roles are Admin, Manager, and Engineer.

## 9. What can an Admin do?

An Admin can manage users, view the system overview, handle pending users, and access global data.

## 10. What can a Manager do?

A Manager can create blocks, assign engineers, review progress, approve or reject blocks, and monitor workload and effort.

## 11. What can an Engineer do?

An Engineer can view assigned blocks, advance workflow stages, and track work progress.

## 12. What is the purpose of the `PENDING` role?

`PENDING` is used for new users who have logged in with Google but have not yet been assigned a final role by an admin.

## 13. How do you prevent unauthorized access?

The frontend uses route guards and role checks, while the backend uses protected routes and authentication middleware. So both UI navigation and API access are controlled.

## 14. What does the block module do?

It stores and manages layout blocks, including their metadata, stage, status, and details.

## 15. What does the assignment module do?

It lets managers assign engineers to blocks and helps prevent over-allocation by checking capacity.

## 16. What does the effort module do?

It tracks estimated effort, actual effort, and effort variance so managers can compare planned work with real work.

## 17. What does the workflow module do?

It shows the block progression through stages such as Not Started, In Progress, DRC, LVS, Review, and Completed.

## 18. Why is audit logging important here?

Audit logs are important because this is a process-driven workflow. Logs help trace who changed what, when they changed it, and why.

## 19. How is MongoDB used?

MongoDB stores application data such as users, blocks, assignments, approvals, effort records, notifications, workflow logs, and login attempts.

## 20. How does the app handle notifications?

The backend creates notification records for events like pending users, assignments, workflow requests, and approvals. The frontend then shows those notifications to the relevant users.

## 21. What is the role of `server/config/passport.js`?

It contains the Google OAuth strategy, user creation and update logic, and Passport session serialization and deserialization.

## 22. What does `server/routes/auth.js` do?

It defines the auth endpoints for Google login, OAuth callback, current user lookup, logout, and login attempt history.

## 23. What does `client/src/shared/context/AuthContext.jsx` do?

It loads the current user from the backend session and stores that user in React state so the whole frontend can access authentication data.

## 24. What does `client/src/router/AppRouter.jsx` do?

It defines the application routes and protects them based on login status and role permissions.

## 25. What is the purpose of `server/services/cleanupService.js`?

It automatically removes old completed blocks and their related records after a retention period.

## 26. What is the purpose of `server/services/notificationService.js`?

It creates notifications for workflow events such as pending users, assignments, stage changes, approvals, and rejections.

## 27. How do you manage environment variables?

The backend loads configuration from a `.env` file, including MongoDB URI, Google OAuth credentials, session secret, admin email, and client URL.

## 28. What makes your project different from a generic task manager?

It is designed specifically for analog layout operations. It includes workflow stages, engineering assignments, review approvals, and effort tracking instead of only generic to-do features.

## 29. What was the hardest part of the project?

The hardest part was connecting Google OAuth, session-based login, and role-based access so the correct user sees the correct dashboard and permissions after sign-in.

## 30. If you had more time, what would you improve?

I would add more analytics, better real-time collaboration, deeper reporting, and stronger validation for workflow optimization and capacity planning.
