import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext.jsx';
import { ToastProvider } from './shared/context/ToastContext.jsx';
import AppRouter from './router/AppRouter.jsx';
import Toast from './shared/components/Toast.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
