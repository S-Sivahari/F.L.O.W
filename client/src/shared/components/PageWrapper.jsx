import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function PageWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} />
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
