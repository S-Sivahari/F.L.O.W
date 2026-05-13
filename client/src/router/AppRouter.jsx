import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../shared/hooks/useAuth.js';
import { canAccess } from '../shared/utils/roleGuard.js';
import { ROLES } from '../shared/constants/roles.js';
import LoadingSpinner from '../shared/components/LoadingSpinner.jsx';

import LoginPage from '../features/auth/pages/LoginPage.jsx';
import PendingPage from '../pages/PendingPage.jsx';
import DashboardPage from '../features/dashboard/pages/DashboardPage.jsx';
import BlocksPage from '../features/blocks/pages/BlocksPage.jsx';
import EffortPage from '../features/effort/pages/EffortPage.jsx';
import WorkflowPage from '../features/workflow/pages/WorkflowPage.jsx';
import AssignmentsPage from '../features/assignments/pages/AssignmentsPage.jsx';
import ApprovalsPage from '../features/approvals/pages/ApprovalsPage.jsx';

function NotFound() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <div style={{ color: 'var(--text-secondary)' }}>This page doesn't exist.</div>
      <a className="btn btn-primary" href="/dashboard">Back to dashboard</a>
    </div>
  );
}

function Protected({ action, children }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role === ROLES.PENDING) return <Navigate to="/pending" replace />;
  if (action && !canAccess(role, action)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending" element={<PendingPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected action="view:dashboard"><DashboardPage /></Protected>} />
      <Route path="/blocks" element={<Protected action="view:blocks"><BlocksPage /></Protected>} />
      <Route path="/effort" element={<Protected action="view:effort"><EffortPage /></Protected>} />
      <Route path="/workflow" element={<Protected action="view:workflow"><WorkflowPage /></Protected>} />
      <Route path="/assignments" element={<Protected action="view:assignments"><AssignmentsPage /></Protected>} />
      <Route path="/approvals" element={<Protected action="view:approvals"><ApprovalsPage /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
