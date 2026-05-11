import useAuth from '../../../shared/hooks/useAuth.js';
import { ROLES } from '../../../shared/constants/roles.js';
import ManagerDashboard from '../components/ManagerDashboard.jsx';
import EngineerDashboard from '../components/EngineerDashboard.jsx';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';

export default function DashboardPage() {
  const { role } = useAuth();
  return (
    <PageWrapper>
      {role === ROLES.ENGINEER ? <EngineerDashboard /> : <ManagerDashboard />}
    </PageWrapper>
  );
}
